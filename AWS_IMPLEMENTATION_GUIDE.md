# AWS implementation guide

## Purpose

Use this guide when Northstar is ready to replace its demo data with real services. Do not connect real member data until privacy, moderation, and account-deletion work is complete.

## The simple picture

The mobile app talks only to an AWS API. AWS handles sign-in, stores the minimum data needed, and sends reminders. The app must never contain AWS secret keys.

```text
Northstar app -> Cognito -> API Gateway -> Lambda -> DynamoDB
                              |              -> EventBridge reminders
                              |              -> Expo push delivery
                              -> CloudWatch audit logs
```

## Before you start

1. Create development, staging, and production environments; a separate production AWS account is best.
2. Turn on a monthly AWS Budget alert before creating billable resources.
3. Choose the AWS Region for member data and get privacy/legal advice for your users.
4. Publish a working privacy policy and account-deletion process.
5. Keep community, direct-message, and video features demo-only until moderation and safety controls are complete.

## Build in this order

### 1. Sign-in

Create an Amazon Cognito user pool with verified email, strong passwords, and optional MFA. Create a mobile app client **without a client secret**. Use the verified Cognito `sub` as the member ID; never trust an ID from the app request body.

### 2. Secure API

Create an API Gateway HTTP API. Every private route requires a Cognito JWT authorizer. Lambda reads the member identity from that token.

Start with:

```text
GET  /v1/meetings
PUT  /v1/me/preferences
POST /v1/me/meetings/{meetingId}
GET  /v1/me/reminders
GET  /v1/me/progress
POST /v1/push-tokens
```

### 3. Keep data small

Use DynamoDB with point-in-time recovery:

- `Profiles`: Cognito ID, pseudonym, settings
- `Meetings`: curated meeting information
- `MemberMeetings`: saved meetings and reminders
- `Progress`: module completion dates
- `Messages`: only after moderation is ready

Do not log journal entries, message bodies, tokens, or unnecessary recovery details.

### 4. Reminders

Use EventBridge Scheduler to trigger Lambda reminder jobs, then send only opted-in notifications through Expo Push. Give users a notification opt-out and expire temporary reminder records with DynamoDB TTL.

### 5. Community and calls

Before releasing posts, messages, or video calls, add block/report, rate limits, moderator review, audit trails, and account deletion. A calling provider must be vetted and clearly disclosed; video needs camera permission and audio needs microphone permission.

### 6. Secrets and app configuration

Store provider credentials in AWS Secrets Manager. Expo/EAS may contain only public identifiers: API URL, AWS Region, Cognito pool ID, and public client ID. Never ship IAM keys, database passwords, or Cognito client secrets.

## Launch checklist

- Cognito JWT on every private API route
- Lambda validates requests and enforces data ownership
- DynamoDB/S3 encrypted with KMS and backups enabled
- Least-privilege IAM roles and CloudTrail/CloudWatch alarms
- WAF or rate limits for public routes
- Deletion, token revocation, notification opt-out, block/report, and moderation tested
- Security/privacy review completed

## Safe rollout

1. Deploy infrastructure using AWS CDK or AWS SAM to development.
2. Test sign-in, expired tokens, reminders, deletion, and unauthorized access.
3. Repeat in staging with no real member data.
4. Check budget alerts, logs, and incident contacts.
5. Deploy production, then replace demo features one at a time.

## If something goes wrong

Disable the affected API route or feature first. Do not delete data during investigation. Review CloudWatch and CloudTrail without exposing message content or tokens. Rotate exposed credentials in Secrets Manager and revoke affected Cognito sessions.

For technical detail, see [aws/ARCHITECTURE.md](aws/ARCHITECTURE.md).
