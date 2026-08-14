# Northstar Recovery

## Public homepage

The repository homepage is the CMA Meet landing site. Start it at `http://localhost:3000` with:

```bash
npm start
```

Build the deployable static site with:

```bash
npm run site:build
```

The privacy policy is available at `/privacy` (production URL: `https://cmameet.site/privacy` once the static site is deployed).

## Mobile app

The Expo app remains in the repository root. Start Metro with:

```bash
npm run mobile
```

An Expo managed-workflow prototype for iOS and Android. It is a private-feeling recovery companion with meeting discovery, a learning path, connection tools, and notification preference demos.

## Run

```bash
npm install
npm start
```

Use `npm run ios` or `npm run android` with an available simulator/device.

## AWS backend readiness

The app now has an AWS-ready HTTP API boundary in [backend.js](./backend.js). It uses only public Expo configuration for the API/Cognito identifiers and keeps future Cognito access tokens in encrypted device storage through `expo-secure-store`.

1. Copy `.env.example` to `.env` and replace only the example values after the AWS dev stack exists.
2. Do **not** add AWS access keys, client secrets, database passwords, or push credentials to `.env`, EAS public variables, or source control.
3. Follow the deployment/security plan in [aws/ARCHITECTURE.md](./aws/ARCHITECTURE.md) before connecting real member data.

The current UI intentionally remains demo/local-only. It will show an explicit configuration error if a future API integration is called before its AWS environment variables are set.

## Notes

- All meeting, community, and reminder content is local demo data; Join, messages, and saved items provide local feedback only.
- The literature action opens the official CMA site in the device browser. This project does not copy or scrape its text.
- `notifications.js` requests permission and schedules an 8-second local demo insight. It needs a physical device for reliable notification testing; remote/push delivery needs Expo credentials and a backend, which are intentionally not included.
- The quick-support action opens the phone app with `988` on platforms that support `tel:`. It is only a shortcut and not a substitute for local emergency services.
