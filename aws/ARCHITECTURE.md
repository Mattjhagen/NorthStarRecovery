# AWS backend blueprint

Northstar should use a serverless AWS backend with a privacy-first boundary:

```text
Expo app
  -> Amazon Cognito (sign-in, MFA and account recovery)
  -> API Gateway HTTP API + Cognito JWT authorizer
  -> Lambda service layer
       -> DynamoDB (profiles, achievements, meeting preferences, direct-message metadata)
       -> EventBridge Scheduler + Lambda (meeting reminder fan-out)
       -> Amazon Pinpoint / SNS or Expo Push service (push delivery)
       -> S3 private bucket (approved resource metadata only, no public health/member data)
  -> CloudWatch / CloudTrail / AWS WAF monitoring and audit
```

## Keep the data model deliberately small

| Data | Store | Notes |
| --- | --- | --- |
| Account ID, pseudonym, settings | DynamoDB `Profiles` | Key by Cognito `sub`; do not require a real name. |
| Meeting catalog | DynamoDB `Meetings` | Curated/imported server-side; clients must not scrape third-party sources. |
| Saved meetings and reminders | DynamoDB `MemberMeetings` | Partition by `memberId`; TTL temporary reminder records. |
| Direct messages | DynamoDB `Messages` | Encrypt at rest; owner-only access checks in Lambda; add reporting/blocking before launch. |
| Learning completion | DynamoDB `Progress` | Store module IDs and timestamps, not sensitive journal content. |

## Security and privacy controls required before production

1. Configure Cognito with email verification, strong password policy, MFA choice, rate limiting and a user-pool app client **without a secret** for the mobile app.
2. Require API Gateway’s Cognito JWT authorizer for every member endpoint; verify `sub` server-side and never trust a member ID passed in a request body.
3. Encrypt DynamoDB/S3 with KMS; enable PITR on member data; set explicit retention/deletion policies.
4. Use least-privilege Lambda roles, AWS Secrets Manager for provider credentials, and separate AWS accounts or at minimum separate stacks for dev/staging/production.
5. Implement block/report workflows, moderation queues, abuse throttling, and audit trails before enabling community posts or direct messages.
6. Publish a privacy policy, data-deletion flow, crisis disclaimer, consent language, and regional data-retention plan before collecting member data.

## Suggested HTTP API contract

All `/v1/me/*`, `/v1/messages/*`, and `/v1/progress/*` routes require a Cognito JWT.

```text
GET  /v1/meetings?format=remote&query=
POST /v1/me/meetings/{meetingId}
GET  /v1/me/reminders
PUT  /v1/me/preferences
GET  /v1/messages/threads
POST /v1/messages/threads/{threadId}/messages
POST /v1/moderation/reports
POST /v1/push-tokens
```

Return only data belonging to the JWT subject. Validate every request with JSON schema in Lambda; do not log message bodies or authorization headers.

## Deployment sequence

1. Create a dedicated AWS account/environment and budget alerts. Choose the AWS region based on your users and legal/privacy advice.
2. Provision Cognito, API Gateway, Lambda, DynamoDB, KMS and CloudWatch through IaC (AWS CDK or SAM) in a non-production stack first.
3. Add the Cognito JWT authorizer, endpoint tests, and a least-privilege IAM review.
4. Deploy the API URL, region, pool ID and public client ID as Expo environment variables. Copy `.env.example` to `.env` locally; store production values in EAS environment variables or CI secrets.
5. Add the production auth flow (PKCE hosted UI or a Cognito-compatible native client), then replace demo meeting/messages/progress data one feature at a time.
6. Run a security/privacy review and test account deletion, token revocation, moderation, and notification opt-out before inviting members.

## Deliberately not in the mobile app

Never ship IAM access keys, AWS secret access keys, Cognito client secrets, database credentials, or a privileged API key in an Expo build. `EXPO_PUBLIC_*` values are configuration identifiers, not secrets.
