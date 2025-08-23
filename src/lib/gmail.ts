const { VITE_GMAIL_CLIENT_ID, VITE_GMAIL_REDIRECT_URI, VITE_GMAIL_TOKEN_ENDPOINT } = import.meta.env;

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

export const sendGmailAuthCode = async (code: string, userId: string) => {
  if (!VITE_GMAIL_TOKEN_ENDPOINT) {
    throw new Error('Missing Gmail token endpoint');
  }
  const res = await fetch(VITE_GMAIL_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, userId }),
  });
  if (!res.ok) {
    throw new Error('Token exchange failed');
  }
  return res.json();
};
