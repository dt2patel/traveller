
# India Travel Log PWA

A simple, mobile-first, offline-first Progressive Web App (PWA) to log entries into and exits from India. Designed for frequent travelers who need to track their stays for tax and residency purposes.

## Features

- **Offline-First:** Log events even without an internet connection. Your data is saved locally and syncs automatically when you're back online.
- **One-Tap Logging:** A large, smart button on the home screen lets you log the next logical event (ENTRY or EXIT) with a single tap.
- **Passwordless Auth:** Secure sign-in using an email link. No passwords to remember.
- **Full History:** View, edit, and delete your entire travel history.
- **Data Export:** Export your travel log to a CSV file for any date range, perfect for tax advisors.
- **Stay Summary:** A dashboard to see your current status, calculate days spent in India over rolling periods (last 182/365 days) and financial years, and forecast future stays.
- **PWA Ready:** Install it on your phone's home screen for a native app-like experience.

## Tech Stack

- **Framework:** React, Vite, TypeScript
- **Styling:** Tailwind CSS
- **State Management:** TanStack Query (React Query)
- **Offline Storage:** IndexedDB via `idb`
- **Backend & Auth:** Firebase (Firestore, Authentication)
- **PWA:** Workbox via `vite-plugin-pwa`
- **Testing:** Vitest, Playwright

---

## 1. Firebase Setup

Before you can run this project, you need to set up a Firebase project.

### Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the on-screen instructions to create a new project.

### Step 2: Create a Web App

1. In your new project's dashboard, click the Web icon (`</>`) to add a new web app.
2. Give your app a nickname (e.g., "India Travel Log").
3. Register the app and Firebase will provide you with a configuration object. **Copy these credentials.**

### Step 3: Enable Authentication

1. In the Firebase Console, go to **Build > Authentication**.
2. Click **Get started**.
3. On the **Sign-in method** tab, select **Email/Password** provider and enable it. Then, enable **Email link (password-less sign-in)**.
4. Add your app's domain to the list of **Authorized domains** if it's not already there (e.g., `localhost` for development, your deployed app's URL for production).

### Step 4: Set up Firestore Database

1. Go to **Build > Firestore Database**.
2. Click **Create database**.
3. Start in **production mode**.
4. Choose a location for your data (e.g., `asia-south1` for Mumbai).
5. Click **Enable**.

### Step 5: Deploy Firestore Security Rules

1. Go to the **Rules** tab in the Firestore Database section.
2. Copy the contents of the `firestore.rules` file from this repository.
3. Paste them into the rules editor, overwriting the default rules.
4. Click **Publish**.

---

## 2. Environment Variables

1. Create a file named `.env.local` in the root of the project.
2. Copy the contents of `.env.example` into your new `.env.local` file.
3. Paste the Firebase credentials you copied in Step 2 into the corresponding `VITE_FIREBASE_*` variables.

Your `.env.local` file should look like this:

```
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef123456"
```

---

## 3. Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [pnpm](https://pnpm.io/installation) (recommended package manager)

### Installation

```bash
pnpm install
```

### Running the Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

- `pnpm dev`: Starts the development server.
- `pnpm build`: Builds the app for production.
- `pnpm preview`: Previews the production build locally.
- `pnpm test`: Runs unit tests with Vitest.
- `pnpm test:e2e`: Runs end-to-end tests with Playwright.
- `pnpm lint`: Lints the code using ESLint.
- `pnpm format`: Formats the code using Prettier.
- `pnpm typecheck`: Checks for TypeScript errors.

---

## 4. How to Use as a PWA on iPhone

1. Open Safari on your iPhone.
2. Navigate to the URL where the app is deployed.
3. Tap the **Share** button in the Safari toolbar (the square icon with an arrow pointing up).
4. Scroll down and tap **Add to Home Screen**.
5. Confirm the name and tap **Add**.

The app icon will now appear on your home screen, and it will launch in a standalone, full-screen window without the Safari UI.

## 5. App Functionality

### Offline Behavior

- The app is fully functional offline. You can add, edit, and delete travel events.
- All changes are saved to a local database in your browser (IndexedDB).
- A sync indicator in the header shows the current status:
  - **Cloud with check:** All changes are synced.
  - **Spinning arrows:** Syncing in progress.
  - **Cloud with slash:** You are offline; changes are queued.

### Data Export & Timestamps

- You can export your travel history from the **History** page.
- The CSV file contains the following columns: `type`, `occurredAt(UTC)`, `occurredTz`, `notes`, `createdAt(UTC)`, `updatedAt(UTC)`.
- **Important:** All timestamps (`occurredAt`, `createdAt`, `updatedAt`) are in **UTC** (ISO 8601 format). The `occurredTz` column shows the IANA timezone of your device when the event was logged (e.g., "Asia/Kolkata"), which provides context for the local time of the event.

### Conflict Resolution

- The app uses a "last write wins" strategy. If you modify the same event on two different devices while they are both offline, the change with the later `updatedAt` timestamp will overwrite the other when they both sync.

## 6. Gmail & Gemini Email Summaries

The project can send automated summaries using Gmail and Google's Gemini API through a scheduled Cloud Function.

### Enable APIs & Set Up OAuth

1. In the [Google Cloud Console](https://console.cloud.google.com/), enable both the **Gmail API** and the **Gemini API**.
2. Configure the **OAuth consent screen** under **APIs & Services** and create OAuth client credentials.
3. Add the following entries to your `.env.local` file:

```bash
GMAIL_CLIENT_ID="your-oauth-client-id.apps.googleusercontent.com"
GMAIL_CLIENT_SECRET="your-oauth-client-secret"
GEMINI_API_KEY="your-gemini-api-key"
```

### Grant Gmail Access

Run the token generation script in the `functions` directory and follow the browser prompts to authorize access. The script stores the OAuth tokens locally so the Cloud Function can send email on your behalf.

### Deploy the Scheduled Cloud Function

Deploy the function after authentication:

```bash
firebase deploy --only functions
```

The function runs on a schedule to send summaries via Gmail and Gemini. Free-tier accounts have daily quotas for sending email and calling the Gemini API, so heavy use may exhaust the allowance.

### Troubleshooting

If the function fails to run, check the execution logs in the Google Cloud Console (**Cloud Functions > Logs**) to diagnose authentication or quota issues.

