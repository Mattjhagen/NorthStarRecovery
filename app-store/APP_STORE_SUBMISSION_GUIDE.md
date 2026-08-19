# App Store Review Response & Submission Package

**App Name:** Northstar Recovery  
**Bundle ID:** `com.northstar.recovery`  
**Guideline Addressed:** Guideline 2.1 - Information Needed - New App Submission

---

## 1. Official App Review Information Notes (Copy & Paste to App Store Connect)

*Copy the following text directly into the **Notes** field in the **App Review Information** section in App Store Connect:*

```text
Dear Apple App Review Team,

Below is the information requested for Northstar Recovery under Guideline 2.1:

1. DEMO ACCOUNT & SIGN-IN:
- Email: test@purepulse.one
- Password: [Insert your active test password, or tap 'Explore in demo mode' on the welcome screen]
- Account Deletion Flow: In You tab > 'Delete account & data' permanently wipes profile, journals, and credentials from AWS.
- Admin / Moderation Flow: test@purepulse.one has moderator rights. In You tab > ADMIN > 'Review reports' displays the moderation queue and device-level ban controls.

2. PHYSICAL DEVICE TESTING MATRIX:
- iPhone 15 Pro (iOS 17.5.1, iOS 18.0)
- iPhone 14 (iOS 17.5.1)
- iPad Pro 11-inch (iPadOS 17.5)

3. PURPOSE & TARGET AUDIENCE:
- Purpose: A private, non-clinical recovery companion supporting individuals recovering from addiction (Crystal Meth Anonymous 12-step fellowship).
- Problem & Value: Provides a safe, anonymous hub for meeting discovery, sobriety streak tracking, guided box-breathing, CloudFront audio soundscapes, and peer connection without ads, tracking, or clinical pressure.

4. CORE FEATURE NAVIGATION:
- Today: Anonymous sobriety streak counter, next CMA meeting within 3h, and 1-tap 988 crisis hotline / sponsor shortcut.
- Meetings: Live CMA directory (crystalmeth.org API) with format filters and 1-tap video join links.
- Learn: 9 progressive recovery modules with XP, narrated literature audio, and NIDA science news.
- Calm: 29 streamed soundscapes with 4-2-4-2 box breathing visualizer and timers.
- Connect (Circle): Peer message board. Tap any member profile to block them; long press or tap flag to report posts/comments to admins.
- Messages: Private 1-on-1 messaging with push alerts and report/block actions.
- You: Profile settings, notification toggles, Terms of Service (EULA), Privacy Policy, Medical Disclaimer, and 'Delete account & data'.

5. EXTERNAL SERVICES & PLATFORMS:
- AWS Cognito: Secure authentication & JWT session management.
- AWS API Gateway & Lambda: Serverless REST API backend.
- Amazon DynamoDB: Encrypted database for profiles, journals, reports, and banned devices.
- Amazon CloudFront CDN: Streams audio soundscapes and readings.
- Crystal Meth Anonymous API (crystalmeth.org): Public meeting directory data.
- Jitsi Meet (meet.jit.si): WebRTC peer video rooms.
- Expo Push Services (EAS): Meeting reminders and DM alerts.
- NIDA RSS Feed: Evidence-based recovery news.

6. REGIONAL DIFFERENCES:
The app functions identically and consistently worldwide with no geo-restrictions.

7. REGULATORY, MEDICAL & THIRD-PARTY DISCLOSURES:
- Non-Clinical Status: Strictly an informational peer-support companion; does not provide medical advice, diagnosis, or clinical addiction treatment (Guideline 1.4). Includes clear in-app Medical Disclaimers and direct 988 Lifeline integration.
- Independence: Independent project not affiliated with or endorsed by CMA World Services. Direct links to official public sources (crystalmeth.org) respect copyright.
- Free Application: 100% free with NO paid tiers, subscriptions, or digital purchases.

A physical device screen recording demonstrating the complete user flow (onboarding, login, account deletion, permission prompts, and UGC block/report mechanisms) is attached.

Please let us know if any additional details are needed.
```

---

## 2. Physical Device Screen Recording Checklist & Flow Script

Apple requires a video screen recording captured on a physical iPhone running the latest OS. Use the following 2-minute flow:

| Step | Time | Action to Record | Purpose for Apple Review |
|---|---|---|---|
| **1. Launch & Onboarding** | 0:00 - 0:20 | Launch app from home screen. Show splash animation, then tap "Create an account" or "Sign in" and show the Terms of Service & Privacy Policy link. | Demonstrates clean app launch and terms acceptance (Guideline 1.2 & 2.1). |
| **2. Permissions** | 0:20 - 0:35 | Tap on Profile photo (triggers Photos permission), toggle Nearby Support SOS (triggers Location permission), tap "Invite from contacts" in You tab (triggers Contacts permission). | Demonstrates accurate purpose strings in action (Guideline 5.1.1). |
| **3. Core Features** | 0:35 - 1:00 | Tap through **Today** (sobriety streak reveal), **Meetings** (filter meetings, tap meeting details), **Learn** (open reading player), and **Calm** (start breathing visualizer with soundscape). | Demonstrates core functionality and streaming infrastructure (Guideline 2.1). |
| **4. Community & UGC Safety** | 1:00 - 1:30 | Go to **Connect** (Circle). Tap "Share with the circle" to post. Tap a member's post/comment, open their profile sheet, tap **"Block member"** and confirm. Long press/tap **"Report post"**, select a reason, and submit the report. | Proves full compliance with UGC safety, blocking, and reporting mechanisms (Guideline 1.2). |
| **5. Moderator Review (Admin)** | 1:30 - 1:45 | Go to **You** tab. Under "ADMIN", tap **"Review reports"**. Show the report appearing in the queue, show the **"Suspend + device"** action. | Shows active moderation queue and device-level ban enforcement. |
| **6. Account Deletion** | 1:45 - 2:00 | Scroll down to the bottom of the **You** tab. Tap **"Delete account & data"**. Show the confirmation modal. Tap "Delete Account". Show the app returning cleanly to the Onboarding welcome screen. | Proves in-app account deletion compliance (Guideline 5.1.1(v)). |

---

## 3. How to Attach the Screen Recording in App Store Connect

1. Save the screen recording from your iPhone (`.mov` or `.mp4`).
2. Log in to [App Store Connect](https://appstoreconnect.apple.com/).
3. Navigate to **My Apps** > **Northstar Recovery** > **iOS App Submission**.
4. Scroll to **App Review Information**.
5. Under **Attachment**, click **Choose File** and upload your screen recording.
6. Paste the official notes from Section 1 above into the **Notes** box.
7. Ensure demo credentials are typed in the **Sign-in Information** section.
8. Click **Save** and **Submit for Review** (or reply to Resolution Center).
