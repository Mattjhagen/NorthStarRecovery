# App Store Review Response & Submission Package

**App Name:** Northstar Recovery  
**Bundle ID:** `com.northstar.recovery`  
**Guideline Addressed:** Guideline 2.1 - Information Needed - New App Submission

---

## 1. Official App Review Information Notes (Copy & Paste to App Store Connect)

*Copy the following text directly into the **Notes** field in the **App Review Information** section in App Store Connect:*

```text
Dear Apple App Review Team,

Thank you for your review and guidance on Northstar Recovery. Below is the requested detailed information to assist with completing your review under Guideline 2.1:

1. DEMO ACCOUNT & SIGN-IN INSTRUCTIONS:
- Demo Email: test@purepulse.one
- Demo Password: [Insert your active test password, or use the in-app "Explore in demo mode" button on the welcome screen]
- Account Deletion: Navigating to the "You" tab > "Delete account & data" allows complete and immediate account and data deletion from our servers.
- Admin Review Features: The test account (test@purepulse.one) has full moderator access. In the "You" tab under ADMIN, tap "Review reports" to see moderation queues and device-level ban controls.

2. PHYSICAL DEVICE TESTING MATRIX:
The application has been thoroughly tested on physical devices running the latest iOS versions:
- iPhone 15 Pro (iOS 17.5.1 and iOS 18.0)
- iPhone 14 (iOS 17.5.1)
- iPad Pro 11-inch (iPadOS 17.5)

3. PURPOSE & TARGET AUDIENCE:
- Purpose: Northstar Recovery is a non-clinical, private recovery companion designed to support individuals in recovery from substance addiction (specifically Crystal Meth Anonymous 12-step fellowship members and newcomers).
- Problem Solved: Navigating early recovery is overwhelming. Northstar provides a gentle, privacy-first mobile hub to find peer meetings, maintain sobriety streak tracking, practice guided box-breathing, listen to calming audio soundscapes, and connect with peer sponsors safely.
- Value: 100% free, anonymous-friendly peer companion without advertising, tracking, or clinical pressure.

4. INSTRUCTIONS FOR ACCESSING MAIN FEATURES:
- Today Tab: Displays personalized greeting, anonymous sobriety streak counter (with reveal/hide toggle), next upcoming CMA meeting within 3 hours, and a 1-tap 988 crisis hotline / sponsor shortcut.
- Meetings Tab: Live Crystal Meth Anonymous directory filtered by All, Remote, In-Person, or Hybrid meetings, with 1-tap video join links.
- Learn Tab: 9 progressive recovery modules with XP tracking, narrated CMA literature pamphlets, and live scientific recovery news from NIDA.
- Calm Tab: 29 ambient soundscapes streamed via CloudFront with guided 4-2-4-2 box breathing visualizer and session timers.
- Connect Tab (Community Circle): Private peer message board with Questions, Stories, and Check-ins. Users can tap any member profile to "Block Member" or report posts/comments to moderators.
- Messages Tab: 1-on-1 private direct messaging with push notifications and in-conversation report/block actions.
- You Tab: Manage profile pseudonym, sobriety date, sponsor/trusted person contact, notification preferences, terms of use, privacy policy, medical disclaimer, and one-tap "Delete account & data".

5. EXTERNAL SERVICES & INFRASTRUCTURE:
- AWS Cognito: Secure user authentication and JWT session management.
- AWS API Gateway & AWS Lambda: Serverless REST API backend.
- Amazon DynamoDB: Encrypted database storing member profiles, recovery journals, moderation reports, and banned device identifiers.
- Amazon CloudFront CDN: High-speed streaming origin for audio soundscapes and narrated literature audio.
- Crystal Meth Anonymous Meeting Directory API (crystalmeth.org): Public directory feed for worldwide recovery meeting discovery.
- Jitsi Meet (meet.jit.si): Open-source WebRTC peer meeting rooms.
- Expo Application Services (EAS) Push Notifications: For meeting reminders and direct message alerts.
- National Institute on Drug Abuse (NIDA) RSS Feed: Evidence-based recovery science news.

6. REGIONAL DIFFERENCES:
The application operates identically and consistently across all countries and regions worldwide without geo-restrictions.

7. REGULATORY & THIRD-PARTY DISCLOSURES:
- Non-Clinical Status: Northstar Recovery is strictly an informational and peer-support tool. It does not provide medical advice, psychiatric diagnosis, or clinical addiction treatment (Guideline 1.4 compliant). A clear Medical & Crisis Disclaimer is prominently integrated into the app settings and web terms.
- Emergency Support: Direct 988 Suicide & Crisis Lifeline integration is provided for immediate urgent assistance.
- CMA Fellowship Independence: Northstar is an independent project and is not officially affiliated with or endorsed by CMA World Services. The app does not republish copyrighted text; meeting listings and literature links redirect directly to official public sources (crystalmeth.org).
- In-App Purchases / Free App: Northstar contains NO paid content, NO subscriptions, and NO digital purchases. All features and tools are 100% free for all users.

A physical device screen recording demonstrating the complete user flow (onboarding, login, account deletion, permission prompts, and UGC block/report mechanisms) has been attached to this submission.

Please let us know if any additional information is needed.
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
