# Traveller

Offline-first PWA to log immigration **ENTRY** and **EXIT** events for India travel. The app works completely offline and syncs to Firebase when online.

## Firebase setup
1. [Create a Firebase project](https://console.firebase.google.com) and add a **Web app**.
2. Enable **Email link (passwordless)** authentication in **Auth → Sign-in method**.
3. Create a **Cloud Firestore** database in production mode.
4. Download the web app config values and copy them into `.env` (see `env.example`).
5. Install the Firebase CLI and deploy the security rules:
   ```bash
   firebase login
   firebase deploy --only firestore:rules
   ```

## Environment variables
Create a `.env` file with:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Tests
```bash
npm test        # unit tests
npm run test:e2e
```

## Install as PWA on iPhone
1. Build and deploy or run the dev server on your network.
2. Open the site in Safari on iOS.
3. Tap the share icon and choose **Add to Home Screen**. The app will launch full screen.

## Icons
Provide your own app icons in `public/icons/` (e.g. `icon-180.png`, `icon-192.png`, `icon-512.png`). The folder is git-ignored so you can drop your images there before building.

## Exporting CSV
On the **History** or **Summary** page click **Export CSV** and a file named like `events-YYYY-MM-DD.csv` will download. Columns:
`type, occurredAt (UTC ISO), occurredTz, notes, createdAt, updatedAt`.
All timestamps are stored in UTC; `occurredTz` records the timezone at capture time.

## Offline & Sync
- Events are stored in IndexedDB and added to a local queue.
- When the device goes online, the queue flushes to Firestore (last-write-wins based on `updatedAt`).
- A small indicator in the header shows `Offline`, `Syncing…` or `Synced`.
- The app shell and data are available offline via a service worker.

## Conflict resolution
If the same event is edited on multiple devices, the event with the latest `updatedAt` field overwrites previous versions.
