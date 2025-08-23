import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import oauth2Client from './gmailAuth';

admin.initializeApp();

/**
 * HTTPS callable function to exchange a Gmail auth code for tokens.
 * Persists the resulting refresh and access tokens to Firestore under the
 * authenticated user's document.
 */
export const exchangeGmailCode = functions.https.onCall(async (data, context) => {
  const authCode: string | undefined = data?.authCode;
  const uid = context.auth?.uid;

  if (!authCode || !uid) {
    return { success: false, error: 'Missing auth code or user not authenticated' };
  }

  try {
    const { tokens } = await oauth2Client.getToken(authCode);
    const { refresh_token, access_token, expiry_date } = tokens;

    await admin
      .firestore()
      .doc(`users/${uid}/gmailTokens/tokens`)
      .set(
        {
          refreshToken: refresh_token,
          accessToken: access_token,
          tokenExpiry: expiry_date,
        },
        { merge: true }
      );

    return { success: true };
  } catch (err) {
    functions.logger.error('Failed to exchange Gmail code', err);
    return { success: false, error: (err as Error).message };
  }
});
