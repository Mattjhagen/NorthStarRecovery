# Northstar public site

This is the standalone public site for `cmameet.site`. It contains the landing page and the privacy policy at `/privacy`; the Expo mobile app remains in the repository root.

## Local preview

```bash
cd website
npm ci
npm start
```

## Production build

```bash
cd website
npm ci
npm run build
```

Deploy the generated `website/build` directory as a static site. Configure the host with an SPA rewrite so `/privacy` serves `index.html`, then add `cmameet.site` and `www.cmameet.site` as custom domains. The canonical privacy-policy URL is `https://cmameet.site/privacy`.
