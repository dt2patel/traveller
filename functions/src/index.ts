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

  if (!uid) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called by an authenticated user.'
    );
  }

  if (!authCode) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with an "authCode" argument.'
    );
  }

  try {
    const { tokens } = await oauth2Client.getToken(authCode);
    const { refresh_token, access_token, expiry_date } = tokens;

    if (!access_token) {
      throw new functions.https.HttpsError(
        'internal',
        'Failed to retrieve access token from Google.'
      );
    }

    await admin
      .firestore()
      .doc(`users/${uid}/gmailTokens/tokens`)
      .set(
        {
          accessToken: access_token,
          tokenExpiry: expiry_date,
          ...(refresh_token && { refreshToken: refresh_token }),
        },
        { merge: true }
      );

    return { success: true };
  } catch (err) {
    functions.logger.error(`Failed to exchange Gmail code for user ${uid}`, err);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to exchange authorization code.'
    );
  }
});
