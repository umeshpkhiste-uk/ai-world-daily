# AI World Daily

Cross-platform, single-screen AI news app. It has an Expo React Native client and a TypeScript/Express API. Articles are collected from configured RSS feeds, de-duplicated, categorised, ranked and returned with their original links. The app deliberately opens article links externally rather than creating a detail screen.

## Architecture

```
mobile/     Expo + React Native single dashboard
server/     Express API, RSS collection, ranking, cache and persistence adapters
database/   PostgreSQL schema (ready to use when a database is provisioned)
```

The API defaults to an in-memory store to make local development frictionless. Set `DATABASE_URL` and replace the store adapter with a PostgreSQL client for production. News is never invented: when live sources cannot be loaded, development data is marked `isMock: true` and the app shows a development-data banner.

## Quick start

1. Install Node.js 20+ and copy environment files:

   ```sh
   cp server/.env.example server/.env
   cp mobile/.env.example mobile/.env
   ```

2. Start the API:

   ```sh
   cd server && npm install && npm run dev
   ```

3. In another terminal start Expo:

   ```sh
   cd mobile && npm install && npm start
   ```

   Press `a` for Android or `i` for iOS (on macOS with Xcode installed). For a physical device, point `EXPO_PUBLIC_API_URL` at your computer's LAN address, for example `http://192.168.1.20:4000`.

## Production configuration

`server/.env`:

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default `4000`) |
| `CORS_ORIGIN` | Allowed app origin |
| `RSS_FEEDS` | Comma-separated trusted RSS URLs |
| `OPENAI_API_KEY` | Optional server-only key for a summarisation provider |
| `DATABASE_URL` | PostgreSQL connection URL |

No secret is included in the mobile application. The API is the only place an AI-provider key belongs. The included RSS feeds are official OpenAI and Google AI feeds; add reputable official, research, regulatory, and publisher feeds through `RSS_FEEDS`.

## API

- `GET /news?category=&q=` — ranked, de-duplicated articles
- `GET /news/trending` — trending topics
- `GET /company/:companyName/updates` — **exactly 10** sourced company updates or a clear availability message
- `POST /refresh-news` — re-collect and cache articles
- `GET|POST|DELETE /bookmarks` — device/user bookmark records
- `GET|PUT /preferences` — interests, theme, notification preference

Company results are constructed only from source-backed articles. When fewer than ten reliable items exist, the API returns the available source-backed entries and `availabilityNote`; the mobile UI renders numbered slots up to ten and labels missing slots as unavailable instead of fabricating news.

## Play Store release checklist

Set `expo.android.package` in `mobile/app.json`, use a production HTTPS API URL in `.env`, configure an app icon/splash assets, add a privacy policy, then use EAS Build (`npx eas build --platform android`) to generate an AAB. Configure push credentials and a notification provider before enabling production notifications.

## Tests

```sh
cd server && npm test
```

The unit tests cover exact-ten company response formatting, duplicate elimination, and categorisation. Run the app manually on Android/iOS to verify pull-to-refresh, source links, dark theme, offline errors, filters, bookmarks and settings sheet.
