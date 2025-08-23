const { VITE_GMAIL_CLIENT_ID, VITE_GMAIL_REDIRECT_URI, VITE_GMAIL_TOKEN_ENDPOINT } = import.meta.env;
import { auth } from '@/lib/firebase';

export const startGmailAuth = () => {
  if (!VITE_GMAIL_CLIENT_ID || !VITE_GMAIL_REDIRECT_URI) {
    throw new Error('Missing Gmail OAuth environment variables');
  }
  const params = new URLSearchParams({
    client_id: VITE_GMAIL_CLIENT_ID,
    redirect_uri: VITE_GMAIL_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    access_type: 'offline',
    prompt: 'consent',
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const sendGmailAuthCode = async (code: string) => {
  if (!VITE_GMAIL_TOKEN_ENDPOINT) {
    throw new Error('Missing Gmail token endpoint');
  }
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  const idToken = await user.getIdToken();
  const res = await fetch(VITE_GMAIL_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    let errorMessage = 'Token exchange failed';
    try {
      const errorBody = await res.json();
      if (errorBody.error) {
        errorMessage += `: ${errorBody.error}`;
      }
    } catch (_) {
      // ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }
  return res.json();
};
