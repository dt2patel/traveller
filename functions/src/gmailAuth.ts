import * as admin from 'firebase-admin';
import { google } from 'googleapis';

interface TokenData {
  accessToken?: string;
  refreshToken: string;
  tokenExpiry?: number;
}

/**
 * Returns a Gmail API client with a valid access token for the given user.
 * If the stored token is missing or expired, this helper refreshes it using
 * the Google OAuth refresh token and persists the updated credentials.
 *
 * This code is intended to run in a trusted environment such as a Cloud
 * Function. Do not expose it to the client.
 */
export const getGmailClient = async (userId: string) => {
  const userRef = admin.firestore().collection('users').doc(userId);
  const snap = await userRef.get();
  const data = snap.data() as TokenData | undefined;
  if (!data || !data.refreshToken) {
    throw new Error('Missing OAuth tokens for user');
  }

  let { accessToken, refreshToken, tokenExpiry } = data;
  const now = Date.now();

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  if (!accessToken || !tokenExpiry || tokenExpiry <= now) {
    oauth2.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2.refreshAccessToken();
    accessToken = credentials.access_token || undefined;
    tokenExpiry = credentials.expiry_date || undefined;
    refreshToken = credentials.refresh_token || refreshToken;

    await userRef.set(
      { accessToken, refreshToken, tokenExpiry },
      { merge: true }
    );
  }

  oauth2.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: tokenExpiry,
  });

  return google.gmail({ version: 'v1', auth: oauth2 });
};
