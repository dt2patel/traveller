import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getGmailClient } from './gmailAuth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { google, gmail_v1 } from 'googleapis';

admin.initializeApp();

interface TravelEvent {
  type: 'ENTRY' | 'EXIT';
  occurredAt: string;
  occurredTz: string;
  source: 'import';
  [key: string]: unknown;
}

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error('GEMINI_API_KEY environment variable not set.');
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const decodeBody = (body: gmail_v1.Schema$MessagePartBody | undefined): string => {
  if (!body?.data) return '';
  return Buffer.from(body.data, 'base64').toString('utf-8');
};

const getMessageText = (msg: gmail_v1.Schema$Message): string => {
  const payload = msg.payload;
  if (!payload) return '';
  if (payload.parts && payload.parts.length > 0) {
    return payload.parts.map((p) => decodeBody(p.body)).join('\n');
  }
  return decodeBody(payload.body);
};

export const exchangeGmailCode = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    res.status(401).send('Unauthorized');
    return;
  }

  let userId: string;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    userId = decodedToken.uid;
  } catch (error) {
    functions.logger.error('Error verifying auth token', { error });
    res.status(401).send('Unauthorized');
    return;
  }

  const { code } = req.body as { code?: string };
  if (!code) {
    res.status(400).json({ error: 'Missing code' });
    return;
  }
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    res.status(500).json({ error: 'Missing Google OAuth environment variables' });
    return;
  }
  try {
    const oauth2 = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI,
    );
    const { tokens } = await oauth2.getToken(code);
    if (!tokens.refresh_token) {
      res.status(500).json({ error: 'No refresh token returned' });
      return;
    }
    await admin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('gmailTokens')
      .doc('tokens')
      .set(
        {
          refreshToken: tokens.refresh_token,
          accessToken: tokens.access_token ?? null,
          tokenExpiry: tokens.expiry_date ?? null,
        },
        { merge: true },
      );
    res.json({ success: true });
  } catch (err) {
    functions.logger.error('Error exchanging Gmail code', { err });
    res.status(500).json({ error: 'Failed to exchange code' });
  }
});

export const importTravelEmails = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const usersSnap = await admin.firestore().collection('users').get();
    const runAt = Date.now();

    const processUser = async (user: FirebaseFirestore.QueryDocumentSnapshot) => {
      const userId = user.id;
      const tokenRef = admin
        .firestore()
        .collection('users')
        .doc(userId)
        .collection('gmailTokens')
        .doc('tokens');

      try {
        const tokenData = (await tokenRef.get()).data() as { lastSync?: number; refreshToken?: string } | undefined;
        if (!tokenData || !tokenData.refreshToken) {
          functions.logger.info('No Gmail tokens for user', { userId });
          return;
        }

        const gmail = await getGmailClient(userId);
        const after = tokenData.lastSync ? ` after:${Math.floor(tokenData.lastSync / 1000)}` : '';

        const userFilters = user.data() as {
          gmailLabelFilters?: string[];
          gmailSenderFilters?: string[];
        };

        const getFiltersFromEnv = (envVar?: string): string[] => {
          if (!envVar) return [];
          return envVar.split(',').map((s) => s.trim()).filter(Boolean);
        };
        const envLabelFilters = getFiltersFromEnv(process.env.GMAIL_LABEL_FILTERS);
        const envSenderFilters = getFiltersFromEnv(process.env.GMAIL_SENDER_FILTERS);

        const labelFilters = [...envLabelFilters, ...(userFilters.gmailLabelFilters ?? [])];
        const senderFilters = [...envSenderFilters, ...(userFilters.gmailSenderFilters ?? [])];

        const queryClauses = [
          '(label:Flights OR itinerary OR "boarding pass")',
          ...labelFilters.map((l) => `label:${l}`),
          ...senderFilters.map((s) => `from:${s}`),
        ];
        const query = queryClauses.join(' OR ');
        const q = `${query}${after}`;

        const allMessages: gmail_v1.Schema$Message[] = [];
        let pageToken: string | undefined;
        let apiCalls = 0;
        do {
          const listRes = await gmail.users.messages.list({ userId: 'me', q, pageToken });
          apiCalls++;
          if (listRes.data.messages) {
            allMessages.push(...listRes.data.messages);
          }
          pageToken = listRes.data.nextPageToken || undefined;
        } while (pageToken);

        let hasErrors = false;
        let skipped = 0;
        let processed = 0;
        for (const m of allMessages) {
          if (!m.id) continue;
          try {
            const full = await gmail.users.messages.get({ userId: 'me', id: m.id, format: 'full' });
            apiCalls++;
            const body = getMessageText(full.data);
            if (!body) {
              functions.logger.info('Skipping message with empty body', { userId, messageId: m.id });
              skipped++;
              continue;
            }

            const prompt = `Extract Departure, Arrival, Status from the following email. Return JSON with keys \"Departure\" ({time: <ISO>, tz: <IANA>}), \"Arrival\" ({time: <ISO>, tz: <IANA>}), and \"Status\" (ENTRY or EXIT).\n${body}`;
            const aiRes = await model.generateContent(prompt);
            const text = aiRes.response.text().trim();

            let parsed: any;
            try {
              parsed = JSON.parse(text);
            } catch (e) {
              functions.logger.warn('Invalid JSON from AI', { userId, messageId: m.id, text });
              hasErrors = true;
              skipped++;
              continue;
            }

            if (
              !parsed ||
              (parsed.Status !== 'EXIT' && parsed.Status !== 'ENTRY') ||
              typeof parsed.Departure?.time !== 'string' ||
              typeof parsed.Departure?.tz !== 'string' ||
              typeof parsed.Arrival?.time !== 'string' ||
              typeof parsed.Arrival?.tz !== 'string'
            ) {
              functions.logger.warn('Skipping message due to invalid or incomplete data from AI', {
                userId,
                messageId: m.id,
                text,
              });
              hasErrors = true;
              skipped++;
              continue;
            }

            const event: TravelEvent =
              parsed.Status === 'EXIT'
                ? {
                    type: 'EXIT',
                    occurredAt: parsed.Departure.time,
                    occurredTz: parsed.Departure.tz,
                    source: 'import',
                  }
                : {
                    type: 'ENTRY',
                    occurredAt: parsed.Arrival.time,
                    occurredTz: parsed.Arrival.tz,
                    source: 'import',
                  };

            const eventsRef = admin.firestore().collection(`users/${userId}/events`);
            const existing = await eventsRef
              .where('occurredAt', '==', event.occurredAt)
              .limit(1)
              .get();
            if (existing.empty) {
              await eventsRef.add({
                ...event,
                userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              processed++;
              functions.logger.info('Imported travel event', { userId, occurredAt: event.occurredAt });
            } else {
              skipped++;
              functions.logger.info('Duplicate event skipped', { userId, occurredAt: event.occurredAt });
            }
          } catch (err) {
            hasErrors = true;
            functions.logger.error('Error processing message', { userId, messageId: m.id, err });
          }
        }

        functions.logger.info('Gmail import summary', {
          userId,
          total: allMessages.length,
          processed,
          skipped,
          apiCalls,
        });

        if (!hasErrors) {
          await tokenRef.set({ lastSync: runAt }, { merge: true });
        }
      } catch (err) {
        functions.logger.error('Error processing user', { userId, err });
      }
    };

    await Promise.allSettled(usersSnap.docs.map(processUser));
  });
