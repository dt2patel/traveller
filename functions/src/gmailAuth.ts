import { google } from 'googleapis';

/**
 * Preconfigured OAuth2 client for Gmail operations.
 * Client ID, secret, and redirect URI are pulled from environment variables.
 */
const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI } = process.env;

if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REDIRECT_URI) {
  throw new Error(
    'Missing required Gmail OAuth2 environment variables. Ensure GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REDIRECT_URI are set.'
  );
}

const oauth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
);

export default oauth2Client;
