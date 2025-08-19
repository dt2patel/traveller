# Travel Log App

A dead-simple mobile-friendly web app for logging travel ENTRY/EXIT events between India and the US for tax purposes. Works offline with sync to Firebase, PWA support, and CSV export.

## Firebase Setup
1. Go to https://console.firebase.google.com and create a new project.
2. Add a web app to the project and copy the config values.
3. Enable Authentication > Sign-in method > Email/Password (used for email link passwordless).
4. Enable Firestore Database.
5. Install Firebase CLI: `npm install -g firebase-tools`.
6. Login: `firebase login`.
7. Init: `firebase init firestore`.
8. Deploy rules: `firebase deploy --only firestore:rules`.

## Environment Variables
Copy `.env.example` to `.env` and fill in your Firebase config values from the web app setup.

## Local Dev Commands
- Install dependencies: `npm install`
- Run dev server: `npm run dev`
- Build for production: `npm run build`
- Preview build: `npm run preview`
- Run unit tests: `npm run test`
- Run E2E tests: `npm run test:e2e`
- Lint code: `npm run lint`
- Format code: `npm run format`
- Typecheck: `npm run typecheck`

## How to Build/Install as a PWA on iPhone
1. Run `npm run build` to generate the `dist` folder.
2. Deploy to Vercel/Netlify or serve locally.
3. Open the app URL in Safari on iPhone.
4. Tap the Share icon > "Add to Home Screen".
5. The app will install as a fullscreen PWA with offline support.

## How to Export CSV and Interpret Timestamps
- In History or Summary, click "Export CSV".
- The CSV contains columns: type, occurredAt (UTC ISO string), occurredTz (IANA timezone at capture), notes, createdAt (UTC), updatedAt (UTC).
- To convert occurredAt to local: Use the occurredTz to adjust (e.g., in Excel or code).

## Notes on Offline Behavior and Conflict Resolution
- All actions (log, edit, delete) are stored locally in IndexedDB and queued for sync.
- When online, the queue flushes automatically (on app start, online event).
- Usable offline: Home, Custom, History, Summary use local data.
- Conflicts: Last-write-wins based on `updatedAt` timestamp.
- If sync fails, events marked 'error'; retry on next flush.
- No server code beyond Firebase; host on static providers like Vercel/Netlify.