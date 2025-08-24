import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { setGlobalOptions } from 'firebase-functions/v2';
import { defineSecret, defineString } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import admin from 'firebase-admin';
import { getGmailClient, getOAuth2Client, GOOGLE_CLIENT_SECRET } from './gmailAuth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { gmail_v1 } from 'googleapis';
import type { Request, Response } from 'express';

setGlobalOptions({ region: 'us-central1' });
admin.initializeApp();

export const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
export const GMAIL_LABEL_FILTERS = defineString('GMAIL_LABEL_FILTERS', { default: '' });
export const GMAIL_SENDER_FILTERS = defineString('GMAIL_SENDER_FILTERS', { default: '' });

interface TravelEvent {
  type: 'ENTRY' | 'EXIT';
  occurredAt: string;
  occurredTz: string;
  source: 'import';
  [key: string]: unknown;
}

const getGeminiModel = (() => {
  let model: import('@google/generative-ai').GenerativeModel | undefined;
  return () => {
    if (model) {
      return model;
    }
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    return model;
  };
})();

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

const getFiltersFromParam = (param: string): string[] => {
  if (!param) return [];
  return param.split(',').map((s) => s.trim()).filter(Boolean);
};

export const exchangeGmailCode = onRequest({ secrets: [GOOGLE_CLIENT_SECRET] }, async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  let userId: string;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    userId = decodedToken.uid;
  } catch (error) {
    logger.error('Error verifying auth token', { error });
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const code = req.body?.code;
  if (typeof code !== 'string' || code.length === 0) {
    res.status(400).json({ success: false, error: 'Missing or invalid auth code' });
    return;
  }

  try {
    const oauth2 = getOAuth2Client();
    const { tokens } = await oauth2.getToken(code);
    if (!tokens.refresh_token) {
      res.status(500).json({ success: false, error: 'No refresh token returned' });
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
    logger.error('Error exchanging Gmail code', { err });
    res.status(500).json({ success: false, error: 'Failed to exchange code' });
  }
});

export const importTravelEmails = onSchedule(
  { schedule: 'every 24 hours', secrets: [GEMINI_API_KEY, GOOGLE_CLIENT_SECRET] },
  async () => {
    const usersSnap = await admin.firestore().collection('users').get();
    const runAt = Date.now();

    const model = getGeminiModel();

    const envLabelFilters = getFiltersFromParam(GMAIL_LABEL_FILTERS.value());
    const envSenderFilters = getFiltersFromParam(GMAIL_SENDER_FILTERS.value());

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
          logger.info('No Gmail tokens for user', { userId });
          return;
        }

        const gmail = await getGmailClient(userId);
        const after = tokenData.lastSync ? ` after:${Math.floor(tokenData.lastSync / 1000)}` : '';

        const userFilters = user.data() as {
          gmailLabelFilters?: string[];
          gmailSenderFilters?: string[];
        };

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
              logger.info('Skipping message with empty body', { userId, messageId: m.id });
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
              logger.warn('Invalid JSON from AI', { userId, messageId: m.id, text });
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
              logger.warn('Skipping message due to invalid or incomplete data from AI', {
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
              logger.info('Imported travel event', { userId, occurredAt: event.occurredAt });
            } else {
              skipped++;
              logger.info('Duplicate event skipped', { userId, occurredAt: event.occurredAt });
            }
          } catch (err) {
            hasErrors = true;
            logger.error('Error processing message', { userId, messageId: m.id, err });
          }
        }

        logger.info('Gmail import summary', {
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
        logger.error('Error processing user', { userId, err });
        throw err;
      }
    };

    const results = await Promise.allSettled(usersSnap.docs.map(processUser));
    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      logger.error(`${failures.length} out of ${usersSnap.docs.length} users failed to process.`);
    }
  },
);
