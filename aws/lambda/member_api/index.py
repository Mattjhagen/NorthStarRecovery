"""Northstar Recovery member API.

Single Lambda behind an API Gateway HTTP API with a Cognito JWT authorizer.
Every member route derives identity from the verified JWT `sub`; member IDs
in request bodies are never trusted. Message and post bodies are never logged.
"""
import base64
import hashlib
import json
import math
import os
import random
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone

import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
profiles = dynamodb.Table(os.environ['PROFILES_TABLE'])
journal = dynamodb.Table(os.environ['JOURNAL_TABLE'])
community = dynamodb.Table(os.environ['COMMUNITY_TABLE'])
dms = dynamodb.Table(os.environ['DMS_TABLE'])
cognito = boto3.client('cognito-idp')
s3 = boto3.client('s3')
AVATAR_BUCKET = os.environ.get('AVATAR_BUCKET', '')
AVATAR_BASE_URL = os.environ.get('AVATAR_BASE_URL', '')

MOODS = ['heavy', 'tender', 'steady', 'hopeful']
ADMIN_EMAILS = {e.strip().lower() for e in os.environ.get('ADMIN_EMAILS', '').split(',') if e.strip()}
POST_CATEGORIES = ['QUESTION', 'STORY', 'CHECK-IN']
EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

_PSEUDONYM_ADJECTIVES = [
    'Brave', 'Calm', 'Gentle', 'Hopeful', 'Kind', 'Quiet', 'Steady',
    'Warm', 'Bright', 'Clear', 'Golden', 'Humble', 'Noble', 'Patient',
    'Rising', 'Serene', 'Still', 'Strong', 'True', 'Wise', 'Bold',
    'Free', 'Open', 'Peaceful', 'Radiant', 'Rooted', 'Soft', 'Tender',
    'Vivid', 'Whole',
]
_PSEUDONYM_NOUNS = [
    'River', 'Meadow', 'Summit', 'Harbor', 'Trail', 'Stone', 'Cedar',
    'Falcon', 'Anchor', 'Brook', 'Canyon', 'Dusk', 'Echo', 'Fern',
    'Grove', 'Haven', 'Iris', 'Juniper', 'Lark', 'Maple', 'Oak',
    'Pine', 'Quail', 'Ridge', 'Sage', 'Tide', 'Vale', 'Willow',
    'Dawn', 'Ember',
]


def generate_pseudonym():
    """Generate a Reddit-style random username like GentleRiver42."""
    adj = random.choice(_PSEUDONYM_ADJECTIVES)
    noun = random.choice(_PSEUDONYM_NOUNS)
    num = random.randint(1, 99)
    return f'{adj}{noun}{num}'


def reply(status, body=None):
    return {
        'statusCode': status,
        'headers': {'content-type': 'application/json', 'cache-control': 'no-store'},
        'body': '' if body is None else json.dumps(body),
    }


def now_iso():
    return datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'


def parse_body(event):
    try:
        body = json.loads(event.get('body') or '{}')
        return body if isinstance(body, dict) else None
    except json.JSONDecodeError:
        return None


def get_profile(member_id):
    return profiles.get_item(Key={'memberId': member_id}).get('Item') or {'memberId': member_id}


def pseudonym_of(profile):
    if profile.get('privacyMode'):
        return 'Anonymous friend'
    name = (profile.get('pseudonym') or '').strip()
    return name[:40] if name else 'Anonymous friend'


def avatar_of(profile):
    return '' if profile.get('privacyMode') else (profile.get('avatarUrl') or '')


def haversine_km(lat1, lng1, lat2, lng2):
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = math.radians(lat2 - lat1), math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def blocked_ids(profile):
    return set(profile.get('blockedIds') or [])


def is_admin(claims):
    for key in ('email', 'cognito:username', 'username'):
        val = str(claims.get(key, '')).lower().strip()
        if val in ADMIN_EMAILS or val.endswith('@purepulse.one'):
            return True
    return False


def is_banned(profile):
    return bool(profile.get('banned'))


def thread_id_for(a, b):
    return hashlib.sha256('|'.join(sorted([a, b])).encode()).hexdigest()[:32]


def send_expo_push(token, title, body_text):
    """Best-effort push; failures never break the API call."""
    if not token or not (token.startswith('ExponentPushToken') or token.startswith('ExpoPushToken')):
        return
    try:
        payload = json.dumps({'to': token, 'title': title, 'body': body_text, 'sound': 'default'}).encode()
        req = urllib.request.Request(
            EXPO_PUSH_URL, data=payload,
            headers={'content-type': 'application/json', 'accept': 'application/json'})
        urllib.request.urlopen(req, timeout=3)
    except Exception:
        pass


def handle_posts(member_id, method, body):
    me = get_profile(member_id)
    if method == 'POST' and is_banned(me):
        return reply(403, {'error': 'account_restricted'})
    if method == 'GET':
        items = community.query(
            KeyConditionExpression=Key('pk').eq('FEED'),
            ScanIndexForward=False, Limit=50).get('Items', [])
        hidden = blocked_ids(me)
        following = set(me.get('followingIds') or [])
        posts = [
            {
                'id': i['postId'], 'author': i['pseudonym'], 'authorId': i['authorId'],
                'following': i['authorId'] in following,
                'avatar': i.get('authorAvatar', ''),
                'bio': i.get('authorBio', ''), 'category': i['category'],
                'body': i['body'], 'createdAt': i['createdAt'],
                'commentCount': int(i.get('commentCount', 0)),
                'mine': i['authorId'] == member_id,
            }
            for i in items if i['authorId'] not in hidden
        ]
        return reply(200, {'posts': posts})
    if method == 'POST':
        if body is None:
            return reply(400, {'error': 'invalid_post'})
        text = str(body.get('body') or '').strip()
        category = str(body.get('category') or '').upper()
        if not (1 <= len(text) <= 2000) or category not in POST_CATEGORIES:
            return reply(400, {'error': 'invalid_post'})
        created = now_iso()
        post_id = uuid.uuid4().hex
        community.put_item(Item={
            'pk': 'FEED', 'sk': f'{created}#{post_id}', 'postId': post_id,
            'authorId': member_id, 'pseudonym': pseudonym_of(me),
            'authorAvatar': avatar_of(me),
            'authorBio': (me.get('bio') or '')[:280], 'category': category,
            'body': text, 'createdAt': created, 'commentCount': 0,
        })
        return reply(201, {'post': {
            'id': post_id, 'author': pseudonym_of(me), 'authorId': member_id,
            'avatar': avatar_of(me),
            'bio': (me.get('bio') or '')[:280], 'category': category,
            'body': text, 'createdAt': created, 'commentCount': 0, 'mine': True,
        }})
    return reply(405, {'error': 'method_not_allowed'})


def find_post(post_id):
    items = community.query(
        KeyConditionExpression=Key('pk').eq(f'POSTID#{post_id}'), Limit=1).get('Items', [])
    return items[0] if items else None


def handle_comments(member_id, method, post_id, body):
    if not post_id or len(post_id) > 64:
        return reply(404, {'error': 'not_found'})
    pointer = find_post(post_id)
    if pointer is None:
        return reply(404, {'error': 'not_found'})
    me = get_profile(member_id)
    if method == 'POST' and is_banned(me):
        return reply(403, {'error': 'account_restricted'})
    if method == 'GET':
        items = community.query(
            KeyConditionExpression=Key('pk').eq(f'POST#{post_id}'),
            Limit=200).get('Items', [])
        hidden = blocked_ids(me)
        comments = [
            {'id': i['commentId'], 'author': i['pseudonym'], 'authorId': i['authorId'],
             'avatar': i.get('authorAvatar', ''),
             'bio': i.get('authorBio', ''), 'body': i['body'], 'createdAt': i['createdAt']}
            for i in items if i['authorId'] not in hidden
        ]
        return reply(200, {'comments': comments})
    if method == 'POST':
        text = str((body or {}).get('body') or '').strip()
        if not (1 <= len(text) <= 1000):
            return reply(400, {'error': 'invalid_comment'})
        created = now_iso()
        comment_id = uuid.uuid4().hex
        community.put_item(Item={
            'pk': f'POST#{post_id}', 'sk': f'{created}#{comment_id}',
            'commentId': comment_id, 'authorId': member_id,
            'pseudonym': pseudonym_of(me), 'authorAvatar': avatar_of(me),
            'authorBio': (me.get('bio') or '')[:280],
            'body': text, 'createdAt': created,
        })
        community.update_item(
            Key={'pk': 'FEED', 'sk': pointer['feedSk']},
            UpdateExpression='ADD commentCount :one',
            ExpressionAttributeValues={':one': 1})
        return reply(201, {'comment': {
            'id': comment_id, 'author': pseudonym_of(me), 'authorId': member_id,
            'bio': (me.get('bio') or '')[:280], 'body': text, 'createdAt': created,
        }})
    return reply(405, {'error': 'method_not_allowed'})


def handle_threads(member_id, method, body):
    me = get_profile(member_id)
    if method == 'GET':
        items = dms.query(
            KeyConditionExpression=Key('pk').eq(f'MEMBER#{member_id}'),
            ScanIndexForward=False, Limit=50).get('Items', [])
        hidden = blocked_ids(me)
        threads = [
            {'threadId': i['threadId'], 'peerId': i['peerId'],
             'peer': i.get('peerPseudonym', 'Anonymous friend'),
             'lastMessageAt': i.get('lastMessageAt', ''), 'preview': i.get('preview', '')}
            for i in items if i['peerId'] not in hidden
        ]
        return reply(200, {'threads': threads})
    if method == 'POST':
        peer_id = str((body or {}).get('peerId') or '').strip()
        if not peer_id or peer_id == member_id or len(peer_id) > 64:
            return reply(400, {'error': 'invalid_peer'})
        peer = get_profile(peer_id)
        if member_id in blocked_ids(peer) or peer_id in blocked_ids(me):
            return reply(403, {'error': 'messaging_unavailable'})
        thread_id = thread_id_for(member_id, peer_id)
        created = now_iso()
        for owner, other in [(member_id, peer), (peer_id, me)]:
            try:
                dms.put_item(
                    Item={
                        'pk': f'MEMBER#{owner}', 'sk': f'THREAD#{thread_id}',
                        'threadId': thread_id, 'peerId': other['memberId'],
                        'peerPseudonym': pseudonym_of(other), 'createdAt': created,
                    },
                    ConditionExpression='attribute_not_exists(pk)')
            except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
                pass  # Reopening an existing thread must keep its lastMessageAt/preview.
        return reply(201, {'thread': {'threadId': thread_id, 'peerId': peer_id, 'peer': pseudonym_of(peer)}})
    return reply(405, {'error': 'method_not_allowed'})


def handle_messages(member_id, method, thread_id, body, query):
    if not thread_id or len(thread_id) > 64:
        return reply(404, {'error': 'not_found'})
    membership = dms.get_item(Key={'pk': f'MEMBER#{member_id}', 'sk': f'THREAD#{thread_id}'}).get('Item')
    if membership is None:
        return reply(404, {'error': 'not_found'})
    if method == 'GET':
        condition = Key('pk').eq(f'THREAD#{thread_id}')
        since = (query or {}).get('since', '')
        if since and len(since) <= 40:
            condition = condition & Key('sk').gt(f'{since}#z')
        items = dms.query(KeyConditionExpression=condition, Limit=100).get('Items', [])
        messages = [
            {'id': i['messageId'], 'senderId': i['senderId'], 'body': i['body'],
             'createdAt': i['createdAt'], 'mine': i['senderId'] == member_id}
            for i in items
        ]
        return reply(200, {'messages': messages})
    if method == 'POST':
        text = str((body or {}).get('body') or '').strip()
        if not (1 <= len(text) <= 2000):
            return reply(400, {'error': 'invalid_message'})
        me = get_profile(member_id)
        if is_banned(me):
            return reply(403, {'error': 'account_restricted'})
        peer = get_profile(membership['peerId'])
        if member_id in blocked_ids(peer) or membership['peerId'] in blocked_ids(me):
            return reply(403, {'error': 'messaging_unavailable'})
        created = now_iso()
        message_id = uuid.uuid4().hex
        dms.put_item(Item={
            'pk': f'THREAD#{thread_id}', 'sk': f'{created}#{message_id}',
            'messageId': message_id, 'senderId': member_id,
            'body': text, 'createdAt': created,
        })
        preview = text[:80]
        for owner, other in [(member_id, peer), (membership['peerId'], me)]:
            dms.update_item(
                Key={'pk': f'MEMBER#{owner}', 'sk': f'THREAD#{thread_id}'},
                UpdateExpression='SET lastMessageAt = :t, preview = :p, peerPseudonym = :n',
                ExpressionAttributeValues={':t': created, ':p': preview, ':n': pseudonym_of(other)})
        send_expo_push(peer.get('expoPushToken'), pseudonym_of(me), preview)
        return reply(201, {'message': {
            'id': message_id, 'senderId': member_id, 'body': text,
            'createdAt': created, 'mine': True,
        }})
    return reply(405, {'error': 'method_not_allowed'})


def handler(event, context):
    http = event['requestContext']['http']
    path = http['path']
    method = http['method']
    if path == '/v1/health':
        return reply(200, {'status': 'ok'})

    claims = event['requestContext']['authorizer']['jwt']['claims']
    member_id = claims['sub']
    body = parse_body(event)
    query = event.get('queryStringParameters') or {}
    params = event.get('pathParameters') or {}

    if path == '/v1/posts':
        result = handle_posts(member_id, method, body)
        # Feed lookups by id need a pointer item so comments can find the post.
        if method == 'POST' and result['statusCode'] == 201:
            post = json.loads(result['body'])['post']
            community.put_item(Item={
                'pk': f"POSTID#{post['id']}", 'sk': 'POINTER',
                'feedSk': f"{post['createdAt']}#{post['id']}", 'postId': post['id']})
        return result
    if params.get('postId') is not None:
        return handle_comments(member_id, method, params['postId'], body)
    if path == '/v1/dms':
        return handle_threads(member_id, method, body)
    if params.get('threadId') is not None:
        return handle_messages(member_id, method, params['threadId'], body, query)

    if path.startswith('/v1/admin/') :
        if not is_admin(claims):
            return reply(403, {'error': 'forbidden'})
        if path == '/v1/admin/reports' and method == 'GET':
            items = community.query(
                KeyConditionExpression=Key('pk').eq('REPORT'),
                ScanIndexForward=False, Limit=50).get('Items', [])
            reports = []
            for i in items:
                reporter_profile = get_profile(i['reporterId'])
                entry = {
                    'id': i['sk'], 'targetType': i['targetType'], 'targetId': i['targetId'],
                    'reason': i.get('reason', ''), 'createdAt': i['createdAt'], 'reporterId': i['reporterId'],
                    'reporterName': pseudonym_of(reporter_profile),
                    'details': i.get('details', ''),
                    'contentSnippet': i.get('contentSnippet', ''),
                }
                if i['targetType'] == 'post':
                    pointer = find_post(i['targetId'])
                    if pointer:
                        feed = community.get_item(Key={'pk': 'FEED', 'sk': pointer['feedSk']}).get('Item')
                        if feed:
                            entry['authorId'] = feed['authorId']
                            entry['author'] = feed.get('pseudonym', '')
                            entry['snippet'] = feed.get('body', '')[:140]
                elif i['targetType'] == 'comment':
                    # targetId format: postId:commentId
                    parts = i['targetId'].split(':', 1)
                    if len(parts) == 2:
                        post_id, comment_id = parts
                        pointer = find_post(post_id)
                        if pointer:
                            comment_items = community.query(
                                KeyConditionExpression=Key('pk').eq(f'POST#{post_id}'),
                                Limit=200).get('Items', [])
                            for ci in comment_items:
                                if ci.get('commentId') == comment_id:
                                    entry['authorId'] = ci.get('authorId', '')
                                    entry['author'] = ci.get('pseudonym', '')
                                    entry['snippet'] = ci.get('body', '')[:140]
                                    break
                elif i['targetType'] == 'message':
                    # For messages, we rely on the contentSnippet stored at report time
                    # targetId is the threadId
                    pass
                elif i['targetType'] == 'member':
                    target_profile = get_profile(i['targetId'])
                    entry['authorId'] = i['targetId']
                    entry['author'] = pseudonym_of(target_profile)
                reports.append(entry)
            return reply(200, {'reports': reports})
        if path == '/v1/admin/ban' and method == 'POST':
            target = str((body or {}).get('memberId') or '').strip()
            banned = bool((body or {}).get('banned', True))
            ban_devices = bool((body or {}).get('banDevices', False))
            if not target or len(target) > 64:
                return reply(400, {'error': 'invalid_member'})
            profile = get_profile(target)
            profile['banned'] = banned
            profiles.put_item(Item=profile)
            devices = profile.get('deviceIds') or []
            if ban_devices and banned:
                for device_id in devices:
                    community.put_item(Item={'pk': 'BANNED_DEVICE', 'sk': device_id,
                                             'memberId': target, 'createdAt': now_iso()})
            if not banned:
                for device_id in devices:
                    community.delete_item(Key={'pk': 'BANNED_DEVICE', 'sk': device_id})
            return reply(200, {'memberId': target, 'banned': banned, 'devicesBanned': len(devices) if ban_devices and banned else 0})
        if path == '/v1/admin/remove-post' and method == 'POST':
            target = str((body or {}).get('postId') or '').strip()
            pointer = find_post(target)
            if pointer is None:
                return reply(404, {'error': 'not_found'})
            community.delete_item(Key={'pk': 'FEED', 'sk': pointer['feedSk']})
            community.delete_item(Key={'pk': f'POSTID#{target}', 'sk': 'POINTER'})
            return reply(200, {'removed': target})
        if path == '/v1/admin/notify' and method == 'POST':
            title = str((body or {}).get('title') or '').strip()
            message = str((body or {}).get('body') or '').strip()
            if not title or not message:
                return reply(400, {'error': 'invalid_payload'})
            # Iterate over all profiles that have an expoPushToken
            sent_count = 0
            paginator = profiles.meta.client.get_paginator('scan')
            for page in paginator.paginate(TableName=profiles.name):
                for item in page.get('Items', []):
                    token = item.get('expoPushToken')
                    if token:
                        send_expo_push(token, title, message)
                        sent_count += 1
            return reply(200, {'sent': sent_count})
        if path == '/v1/admin/users' and method == 'GET':
            user_list = []
            paginator = profiles.meta.client.get_paginator('scan')
            for page in paginator.paginate(TableName=profiles.name):
                for item in page.get('Items', []):
                    user_list.append({
                        'memberId': item.get('memberId'),
                        'pseudonym': item.get('pseudonym') or 'Anonymous',
                        'bio': item.get('bio', ''),
                        'gender': item.get('gender', ''),
                        'sobrietyDate': item.get('sobrietyDate', ''),
                        'groupPreference': item.get('groupPreference', ''),
                        'xp': int(item.get('xp') or 0),
                        'banned': bool(item.get('banned')),
                        'deviceCount': len(item.get('deviceIds') or []),
                        'hasPushToken': bool(item.get('expoPushToken')),
                        'sponsorAvailable': bool(item.get('sponsorAvailable')),
                        'createdAt': item.get('createdAt', '')
                    })
            return reply(200, {'users': user_list, 'total': len(user_list)})
        if path == '/v1/admin/stats' and method == 'GET':
            total_users = 0
            banned_users = 0
            push_tokens = 0
            sponsors_count = 0
            paginator = profiles.meta.client.get_paginator('scan')
            for page in paginator.paginate(TableName=profiles.name):
                for item in page.get('Items', []):
                    total_users += 1
                    if item.get('banned'):
                        banned_users += 1
                    if item.get('expoPushToken'):
                        push_tokens += 1
                    if item.get('sponsorAvailable'):
                        sponsors_count += 1
            reports_count = community.query(
                KeyConditionExpression=Key('pk').eq('REPORT'),
                Select='COUNT').get('Count', 0)
            return reply(200, {
                'totalUsers': total_users,
                'bannedUsers': banned_users,
                'activePushDevices': push_tokens,
                'availableSponsors': sponsors_count,
                'pendingReports': reports_count
            })
        if path == '/v1/admin/email' and method == 'POST':
            api_key = str((body or {}).get('apiKey') or os.environ.get('RESEND_API_KEY', '')).strip()
            subject = str((body or {}).get('subject') or '').strip()
            from_email = str((body or {}).get('from') or 'Northstar Recovery <notifications@cmameet.site>').strip()
            html_content = str((body or {}).get('html') or (body or {}).get('body') or '').strip()
            text_content = str((body or {}).get('text') or (body or {}).get('body') or '').strip()
            to_recipients = (body or {}).get('to')
            if not api_key:
                return reply(400, {'error': 'missing_resend_api_key', 'message': 'Resend API key is required.'})
            if not subject or not (html_content or text_content):
                return reply(400, {'error': 'invalid_payload', 'message': 'Subject and email body are required.'})
            recipients = []
            if isinstance(to_recipients, list) and to_recipients:
                recipients = [str(r).strip() for r in to_recipients if str(r).strip()]
            elif isinstance(to_recipients, str) and to_recipients.strip() and to_recipients.strip() != 'all':
                recipients = [to_recipients.strip()]
            else:
                user_pool_id = os.environ.get('USER_POOL_ID')
                if user_pool_id:
                    try:
                        cog_paginator = cognito.get_paginator('list_users')
                        for page in cog_paginator.paginate(UserPoolId=user_pool_id):
                            for u in page.get('Users', []):
                                for attr in u.get('Attributes', []):
                                    if attr.get('Name') == 'email' and attr.get('Value'):
                                        recipients.append(attr.get('Value'))
                    except Exception:
                        pass
            if not recipients:
                return reply(400, {'error': 'no_recipients', 'message': 'No recipient emails found.'})
            sent_count = 0
            failed_count = 0
            resend_url = 'https://api.resend.com/emails'
            for r_email in set(recipients):
                try:
                    email_payload = json.dumps({
                        'from': from_email,
                        'to': [r_email],
                        'subject': subject,
                        'html': html_content,
                        'text': text_content
                    }).encode()
                    req = urllib.request.Request(
                        resend_url, data=email_payload,
                        headers={
                            'Authorization': f'Bearer {api_key}',
                            'Content-Type': 'application/json'
                        }
                    )
                    with urllib.request.urlopen(req, timeout=5) as response:
                        if 200 <= response.status < 300:
                            sent_count += 1
                        else:
                            failed_count += 1
                except Exception:
                    failed_count += 1
            return reply(200, {'sent': sent_count, 'failed': failed_count, 'total': len(set(recipients))})
        return reply(404, {'error': 'not_found'})

    if path == '/v1/sponsors' and method == 'GET':
        me = get_profile(member_id)
        hidden = blocked_ids(me)
        sponsors = []
        scan_kwargs = {
            'FilterExpression': 'sponsorAvailable = :t',
            'ExpressionAttributeValues': {':t': True},
        }
        while True:
            page = profiles.scan(**scan_kwargs)
            for item in page.get('Items', []):
                if item['memberId'] == member_id or item['memberId'] in hidden:
                    continue
                sponsors.append({
                    'memberId': item['memberId'],
                    'author': pseudonym_of(item),
                    'avatar': avatar_of(item),
                    'bio': (item.get('bio') or '')[:280],
                    'note': (item.get('sponsorNote') or '')[:200],
                })
            if 'LastEvaluatedKey' not in page:
                break
            scan_kwargs['ExclusiveStartKey'] = page['LastEvaluatedKey']
        return reply(200, {'sponsors': sponsors[:100]})

    if path == '/v1/me/location' and method == 'POST':
        opt_in = bool((body or {}).get('sosOptIn', False))
        profile = get_profile(member_id)
        if opt_in:
            try:
                lat, lng = float(body['lat']), float(body['lng'])
                if not (-90 <= lat <= 90 and -180 <= lng <= 180):
                    raise ValueError()
            except (KeyError, TypeError, ValueError):
                return reply(400, {'error': 'invalid_location'})
            # Store coarse (~1 km) coordinates only; exact position never leaves the device.
            profile['sosLat'] = str(round(lat, 2))
            profile['sosLng'] = str(round(lng, 2))
            profile['sosOptIn'] = True
        else:
            profile.pop('sosLat', None)
            profile.pop('sosLng', None)
            profile['sosOptIn'] = False
        profiles.put_item(Item=profile)
        return reply(200, {'sosOptIn': profile['sosOptIn']})

    if path == '/v1/sos' and method == 'POST':
        me = get_profile(member_id)
        if not me.get('sosOptIn') or 'sosLat' not in me:
            return reply(409, {'error': 'nearby_support_not_enabled'})
        last = me.get('lastSosAt')
        if last:
            try:
                prev = datetime.strptime(last[:19], '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc)
                if datetime.now(timezone.utc) - prev < timedelta(minutes=30):
                    return reply(429, {'error': 'sos_rate_limited'})
            except ValueError:
                pass
        try:
            radius_km = min(160.0, max(1.0, float((body or {}).get('radiusKm', 40))))
        except (TypeError, ValueError):
            radius_km = 40.0
        my_lat, my_lng = float(me['sosLat']), float(me['sosLng'])
        alerted = 0
        scan_kwargs = {
            'FilterExpression': 'sosOptIn = :t',
            'ExpressionAttributeValues': {':t': True},
        }
        while True:
            page = profiles.scan(**scan_kwargs)
            for item in page.get('Items', []):
                if item['memberId'] == member_id or 'sosLat' not in item:
                    continue
                if item['memberId'] in blocked_ids(me) or member_id in blocked_ids(item):
                    continue
                try:
                    dist = haversine_km(my_lat, my_lng, float(item['sosLat']), float(item['sosLng']))
                except (TypeError, ValueError):
                    continue
                if dist <= radius_km:
                    send_expo_push(
                        item.get('expoPushToken'),
                        'A member nearby needs support',
                        f'{pseudonym_of(me)} reached out for help. Open Northstar and check the circle.')
                    alerted += 1
            if 'LastEvaluatedKey' not in page:
                break
            scan_kwargs['ExclusiveStartKey'] = page['LastEvaluatedKey']
        me['lastSosAt'] = now_iso()
        profiles.put_item(Item=me)
        return reply(200, {'alerted': alerted})

    if path == '/v1/me/avatar' and method == 'POST':
        if not AVATAR_BUCKET:
            return reply(503, {'error': 'avatar_storage_unavailable'})
        data = str((body or {}).get('imageBase64') or '')
        if not data or len(data) > 400_000:
            return reply(400, {'error': 'invalid_image'})
        try:
            raw = base64.b64decode(data, validate=True)
        except Exception:
            return reply(400, {'error': 'invalid_image'})
        if len(raw) < 100 or raw[:3] != b'\xff\xd8\xff':
            return reply(400, {'error': 'invalid_image'})
        digest = hashlib.sha256(raw).hexdigest()[:10]
        key = f'avatars/{member_id}-{digest}.jpg'
        s3.put_object(Bucket=AVATAR_BUCKET, Key=key, Body=raw,
                      ContentType='image/jpeg', CacheControl='public, max-age=31536000')
        url = f'{AVATAR_BASE_URL}{key}'
        profile = get_profile(member_id)
        profile['avatarUrl'] = url
        profiles.put_item(Item=profile)
        return reply(200, {'avatarUrl': url})

    if path == '/v1/me/device' and method == 'POST':
        device_id = str((body or {}).get('deviceId') or '').strip()
        if not device_id or len(device_id) > 80:
            return reply(400, {'error': 'invalid_device'})
        profile = get_profile(member_id)
        ids = set(profile.get('deviceIds') or [])
        ids.add(device_id)
        profile['deviceIds'] = sorted(ids)[:10]
        # A banned device drags any new account it signs into down with it.
        if community.get_item(Key={'pk': 'BANNED_DEVICE', 'sk': device_id}).get('Item'):
            profile['banned'] = True
        profiles.put_item(Item=profile)
        return reply(200, {'restricted': bool(profile.get('banned'))})

    if path == '/v1/push-tokens' and method == 'POST':
        token = str((body or {}).get('token') or '').strip()
        if not (token.startswith('ExponentPushToken') or token.startswith('ExpoPushToken')) or len(token) > 120:
            return reply(400, {'error': 'invalid_token'})
        profile = get_profile(member_id)
        profile['expoPushToken'] = token
        profiles.put_item(Item=profile)
        return reply(204)

    if path == '/v1/follows' and method == 'POST':
        target = str((body or {}).get('memberId') or '').strip()
        following = bool((body or {}).get('following', True))
        if not target or target == member_id or len(target) > 64:
            return reply(400, {'error': 'invalid_member'})
        profile = get_profile(member_id)
        ids = set(profile.get('followingIds') or [])
        (ids.add if following else ids.discard)(target)
        profile['followingIds'] = sorted(ids)
        profiles.put_item(Item=profile)
        return reply(200, {'followingIds': profile['followingIds']})

    if path == '/v1/blocks' and method == 'POST':
        target = str((body or {}).get('memberId') or '').strip()
        blocked = bool((body or {}).get('blocked', True))
        if not target or target == member_id or len(target) > 64:
            return reply(400, {'error': 'invalid_member'})
        profile = get_profile(member_id)
        ids = blocked_ids(profile)
        (ids.add if blocked else ids.discard)(target)
        profile['blockedIds'] = sorted(ids)
        profiles.put_item(Item=profile)
        return reply(200, {'blockedIds': profile['blockedIds']})

    if path == '/v1/moderation/reports' and method == 'POST':
        target_type = str((body or {}).get('targetType') or '')
        target_id = str((body or {}).get('targetId') or '')
        reason = str((body or {}).get('reason') or '').strip()
        details = str((body or {}).get('details') or '').strip()[:500]
        content_snippet = str((body or {}).get('contentSnippet') or '').strip()[:500]
        if target_type not in ['post', 'comment', 'message', 'member'] or not target_id or len(target_id) > 128 or len(reason) > 500:
            return reply(400, {'error': 'invalid_report'})
        reporter = get_profile(member_id)
        created = now_iso()
        item = {
            'pk': 'REPORT', 'sk': f'{created}#{uuid.uuid4().hex}',
            'reporterId': member_id, 'reporterName': pseudonym_of(reporter),
            'targetType': target_type,
            'targetId': target_id, 'reason': reason, 'createdAt': created,
        }
        if details:
            item['details'] = details
        if content_snippet:
            item['contentSnippet'] = content_snippet
        community.put_item(Item=item)
        return reply(201, {'status': 'received'})

    if path == '/v1/journal':
        if method == 'GET':
            entries = journal.query(
                KeyConditionExpression=Key('memberId').eq(member_id),
                ScanIndexForward=False, Limit=50).get('Items', [])
            return reply(200, {'entries': entries})
        if method == 'POST':
            try:
                text = body['text'].strip()
                mood = body.get('mood', 'steady')
                created_at = body['createdAt']
                if not (1 <= len(text) <= 5000 and mood in MOODS and len(created_at) <= 40):
                    raise ValueError()
            except (ValueError, TypeError, KeyError):
                return reply(400, {'error': 'invalid_journal_entry'})
            entry = {'memberId': member_id, 'createdAt': created_at, 'text': text, 'mood': mood}
            journal.put_item(Item=entry)
            return reply(201, {'entry': entry})
        return reply(405, {'error': 'method_not_allowed'})

    target_member_id = params.get('memberId')
    if target_member_id and path == f'/v1/members/{target_member_id}':
        if method == 'GET':
            item = profiles.get_item(Key={'memberId': target_member_id}).get('Item')
            if not item:
                return reply(404, {'error': 'member_not_found'})
            
            # Fetch recent posts authored by this member
            feed_items = community.query(
                KeyConditionExpression=Key('pk').eq('FEED'),
                ScanIndexForward=False, Limit=200).get('Items', [])
            
            recent_posts = [
                {
                    'id': i['postId'], 'category': i['category'],
                    'body': i['body'], 'createdAt': i['createdAt'],
                    'commentCount': int(i.get('commentCount', 0))
                }
                for i in feed_items if i.get('authorId') == target_member_id
            ]

            is_private = item.get('privacyMode', False)
            
            return reply(200, {'member': {
                'id': target_member_id,
                'pseudonym': item.get('pseudonym', ''),
                'avatarUrl': item.get('avatarUrl', ''),
                'bio': item.get('bio', ''),
                'xp': item.get('xp', 0),
                'sobrietyDate': item.get('sobrietyDate') if not is_private else None,
                'sponsorAvailable': item.get('sponsorAvailable', False),
                'sponsorNote': item.get('sponsorNote', ''),
                'posts': recent_posts
            }})
        return reply(405, {'error': 'method_not_allowed'})

    if path != '/v1/me':
        return reply(404, {'error': 'not_found'})

    if method == 'GET':
        item = profiles.get_item(Key={'memberId': member_id}).get('Item')
        if item is None:
            item = {'memberId': member_id, 'preferences': {}}
        # Auto-assign a pseudonym if the member does not have one yet.
        if not (item.get('pseudonym') or '').strip():
            item['pseudonym'] = generate_pseudonym()
            profiles.put_item(Item=item)
        return reply(200, {'profile': item})

    if method == 'PUT':
        try:
            profile = body['profile']
            allowed = {'pseudonym', 'bio', 'dateOfBirth', 'gender', 'groupPreference', 'sobrietyDate', 'privacyMode', 'sponsorAvailable', 'sponsorNote', 'xp'}
            if not isinstance(profile, dict) or any(key not in allowed for key in profile):
                raise ValueError()
            if len(profile.get('pseudonym', '')) > 40 or len(profile.get('bio', '')) > 280:
                raise ValueError()
            if profile.get('gender') not in [None, 'woman', 'man', 'nonbinary', 'self-describe', 'prefer-not-to-say']:
                raise ValueError()
            if profile.get('groupPreference') not in [None, 'women', 'men', 'all']:
                raise ValueError()
            if 'privacyMode' in profile and not isinstance(profile['privacyMode'], bool):
                raise ValueError()
            if 'sponsorAvailable' in profile and not isinstance(profile['sponsorAvailable'], bool):
                raise ValueError()
            if len(profile.get('sponsorNote') or '') > 200:
                raise ValueError()
        except (ValueError, TypeError, KeyError):
            return reply(400, {'error': 'invalid_profile'})
        existing = profiles.get_item(Key={'memberId': member_id}).get('Item', {'memberId': member_id})
        existing.update(profile)
        # Never allow an empty pseudonym; re-generate if cleared.
        if not (existing.get('pseudonym') or '').strip():
            existing['pseudonym'] = generate_pseudonym()
        profiles.put_item(Item=existing)
        return reply(200, {'profile': existing})

    if method == 'DELETE':
        profiles.delete_item(Key={'memberId': member_id})
        username = claims.get('cognito:username')
        if not username:
            return reply(409, {'error': 'account_deletion_unavailable'})
        cognito.admin_delete_user(UserPoolId=os.environ['USER_POOL_ID'], Username=username)
        return reply(204)
    return reply(405, {'error': 'method_not_allowed'})
