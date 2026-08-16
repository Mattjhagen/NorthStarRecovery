"""Northstar Recovery member API.

Single Lambda behind an API Gateway HTTP API with a Cognito JWT authorizer.
Every member route derives identity from the verified JWT `sub`; member IDs
in request bodies are never trusted. Message and post bodies are never logged.
"""
import base64
import hashlib
import json
import os
import urllib.request
import uuid
from datetime import datetime, timezone

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
POST_CATEGORIES = ['QUESTION', 'STORY', 'CHECK-IN']
EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'


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


def blocked_ids(profile):
    return set(profile.get('blockedIds') or [])


def thread_id_for(a, b):
    return hashlib.sha256('|'.join(sorted([a, b])).encode()).hexdigest()[:32]


def send_expo_push(token, title, body_text):
    """Best-effort push; failures never break the API call."""
    if not token or not token.startswith('ExponentPushToken'):
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
    if method == 'GET':
        items = community.query(
            KeyConditionExpression=Key('pk').eq('FEED'),
            ScanIndexForward=False, Limit=50).get('Items', [])
        hidden = blocked_ids(me)
        posts = [
            {
                'id': i['postId'], 'author': i['pseudonym'], 'authorId': i['authorId'],
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

    if path == '/v1/push-tokens' and method == 'POST':
        token = str((body or {}).get('token') or '').strip()
        if not token.startswith('ExponentPushToken') or len(token) > 120:
            return reply(400, {'error': 'invalid_token'})
        profile = get_profile(member_id)
        profile['expoPushToken'] = token
        profiles.put_item(Item=profile)
        return reply(204)

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
        if target_type not in ['post', 'comment', 'message', 'member'] or not target_id or len(target_id) > 64 or len(reason) > 500:
            return reply(400, {'error': 'invalid_report'})
        created = now_iso()
        community.put_item(Item={
            'pk': 'REPORT', 'sk': f'{created}#{uuid.uuid4().hex}',
            'reporterId': member_id, 'targetType': target_type,
            'targetId': target_id, 'reason': reason, 'createdAt': created,
        })
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

    if path != '/v1/me':
        return reply(404, {'error': 'not_found'})

    if method == 'GET':
        item = profiles.get_item(Key={'memberId': member_id}).get('Item')
        return reply(200, {'profile': item or {'memberId': member_id, 'preferences': {}}})

    if method == 'PUT':
        try:
            profile = body['profile']
            allowed = {'pseudonym', 'bio', 'dateOfBirth', 'gender', 'groupPreference', 'sobrietyDate', 'privacyMode'}
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
        except (ValueError, TypeError, KeyError):
            return reply(400, {'error': 'invalid_profile'})
        existing = profiles.get_item(Key={'memberId': member_id}).get('Item', {'memberId': member_id})
        existing.update(profile)
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
