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

  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
  } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error(
      'Missing one or more required Google OAuth environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI',
    );
  }

  const oauth2 = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
  );

  return admin.firestore().runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const data = snap.data() as TokenData | undefined;
    if (!data || !data.refreshToken) {
      throw new Error('Missing OAuth tokens for user');
    }

    let { accessToken, refreshToken, tokenExpiry } = data;
    const now = Date.now();

    if (!accessToken || !tokenExpiry || tokenExpiry <= now) {
      oauth2.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await oauth2.refreshAccessToken();
      if (!credentials.access_token) {
        throw new Error('Failed to refresh access token.');
      }
      accessToken = credentials.access_token;
      tokenExpiry = credentials.expiry_date ?? undefined;
      refreshToken = credentials.refresh_token ?? refreshToken;

      tx.set(
        userRef,
        { accessToken, refreshToken, tokenExpiry },
        { merge: true },
      );
    }

    oauth2.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: tokenExpiry,
    });

    return google.gmail({ version: 'v1', auth: oauth2 });
  });
};
