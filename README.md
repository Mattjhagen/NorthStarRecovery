# Northstar Recovery

A private recovery companion app for Crystal Meth Anonymous, built with React Native / Expo SDK 54. Targets iOS and Android via EAS Build (production profile, `autoIncrement: true`).

---

## Quick start

```bash
npm install
npm run mobile          # Metro dev server
npm run ios             # iOS simulator
npm run android         # Android emulator
```

Build for stores:

```bash
eas build --platform all --profile production
```

---

## What works today

### Auth & onboarding
- Create account / sign in / email confirmation (AWS Cognito via `auth.js`)
- Profile: pseudonym, bio, photo (photo library), DOB, gender, group preference, sobriety date
- Sign out

### Today tab
- Time-of-day greeting personalised to the user's pseudonym
- Sobriety streak with privacy blur (reveal / hide toggle)
- Sponsor quick-card — one-tap call and SMS to saved sponsor
- Auto-detected next CMA meeting card (within 3 hours) with direct join link
- Quick nav shortcuts to Meetings and Calm tabs
- Crisis button — calls saved sponsor or dials 988

### Meetings tab
- Live CMA meeting list from the crystalmeth.org API (falls back to 6 hardcoded entries)
- Search and filter by format (All / Remote / In-person / Hybrid)
- One-tap join link per meeting
- Host a free Jit.si video room — generates a unique URL, native share sheet

### Learn tab
- 9 progressive learning modules with XP tracking (unlock in sequence)
- CMA Readings library — audio player (play / pause / seek / ±15s skip) + PDF link per pamphlet; narrated by Jessica
- NIDA RSS news feed (live, up to 6 articles)

### Calm tab
- 29 soundscapes streamed from CloudFront, categorised (Ambient, Nature, Rain, Atmospheric, Electronic)
- Animated breathing guide — 4-2-4-2 box breathing with live visual pulse
- 5 / 10 / 20 minute session timer
- Visual loop selector (Breath / Night / Waves)
- Plays in background and through iOS silent mode

### Connect tab
- Local community circle — post Questions, Stories, or Check-ins
- Comment threads on any post
- Member profile sheet — view bio, block member
- DM sheet (UI present, backend not connected)

### Journal tab
- Private entries with mood selector (Heavy / Tender / Steady / Hopeful)
- Syncs to backend API if configured; local-only otherwise

### You tab
- Profile card with edit shortcut
- Sponsor card with one-tap call / text chips
- Trusted person status indicator
- Notification toggles: meeting reminders, daily inspiration (9 AM), evening check-in (8 PM), circle alerts
- Demo notification fires in 8 seconds (physical device required)
- Anonymous / privacy mode toggle
- Invite a friend via native Share sheet
- Venmo donation card ($2 / $5 / $10) — deep links to `@rooteddaily`, falls back to venmo.com
- Link to crystalmeth.org literature
- Sign out

---

## What needs to be done

| Item | Notes |
|---|---|
| Connect DM backend | UI is complete; needs a real-time messaging service wired to the API |
| Connect community feed backend | Posts and comments are currently local only |
| Journal & profile sync | Works when `EXPO_PUBLIC_API_URL` env var is set; needs AWS stack deployed |
| Push notifications | `notifications.js` schedules local notifications; remote push needs Expo credentials + backend endpoint |
| "Play for room" in readings | Button shows a placeholder alert; needs Jit.si / video integration |
| GitHub Pages source | Repo Settings → Pages → set source to `gh-pages` branch so `cmameet.site` serves the React landing page |
| App Store submission | Submit the next successful iOS EAS build via `eas submit --platform ios` — needs Apple numeric app ID |
| Play Store submission | Submit Android build via `eas submit --platform android` |

---

## Environment variables

Copy `.env.example` to `.env` and fill in values after the AWS stack is deployed. Never commit real credentials.

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL for the HTTP API (journal, profile, community) |
| `EXPO_PUBLIC_USER_POOL_ID` | Cognito user pool ID |
| `EXPO_PUBLIC_USER_POOL_CLIENT_ID` | Cognito app client ID |
| `EXPO_PUBLIC_CLOUDFRONT_SOUNDSCAPES` | CloudFront origin for soundscape `.wav` files |

The app detects missing config at runtime (`isBackendConfigured()` in `backend.js`) and silently falls back to local-only mode rather than crashing.

---

## Future features (roadmap)

- **Real-time DM** — end-to-end encrypted direct messaging between members (WebSocket or AWS AppSync)
- **Check-in streaks** — daily mood check-in with streak tracking, shared optionally with trusted person
- **Step-work tracker** — guided 12-step prompts and private notes per step
- **Sponsor matching** — opt-in directory so new members can request a sponsor
- **Meeting attendance log** — log meetings attended, visible only to the member
- **Progress milestones** — 30 / 60 / 90 / 180 / 1-year badges with shareable cards
- **Offline mode** — cache soundscapes and readings for use without network
- **iPad / tablet layout** — responsive two-column layout for wider screens
- **Apple Watch companion** — sobriety counter and quick 988 shortcut from the wrist
- **Dark / light theme toggle** — currently dark-only; system theme respect
- **Localisation (Spanish)** — large Spanish-speaking CMA community; i18n groundwork already noted in meeting fallback data

---

## AWS backend readiness

The HTTP API boundary lives in [`backend.js`](./backend.js). Cognito tokens are stored encrypted via `expo-secure-store`. See [`aws/ARCHITECTURE.md`](./aws/ARCHITECTURE.md) for the deployment and security plan before connecting real member data.

---

## Website

The `website/` directory is a React landing page for `cmameet.site`. Start it locally:

```bash
npm start               # runs website dev server on :3000
npm run site:build      # production build
```

---

## Notes

- Meeting data is fetched live from crystalmeth.org. The app does not copy or scrape CMA literature text.
- The quick-support action opens the phone dialler with `988`. It is a shortcut only, not a substitute for emergency services.
- EAS production profile has `"autoIncrement": true` and `"appVersionSource": "remote"` — build numbers increment automatically.
- Soundscapes are streamed from `https://d10rkhd3bzdolj.cloudfront.net/soundscapes/` — no audio assets are bundled in the app binary.
