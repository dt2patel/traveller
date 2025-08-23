import { google } from 'googleapis';

/**
 * Preconfigured OAuth2 client for Gmail operations.
 * Client ID, secret, and redirect URI are pulled from environment variables.
 */
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

export default oauth2Client;
