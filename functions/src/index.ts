import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getGmailClient } from './gmailAuth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { gmail_v1 } from 'googleapis';

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
        const q = `(label:Flights OR itinerary OR "boarding pass")${after}`;

        const allMessages: gmail_v1.Schema$Message[] = [];
        let pageToken: string | undefined;
        do {
          const listRes = await gmail.users.messages.list({ userId: 'me', q, pageToken });
          if (listRes.data.messages) {
            allMessages.push(...listRes.data.messages);
          }
          pageToken = listRes.data.nextPageToken || undefined;
        } while (pageToken);

        let hasErrors = false;
        for (const m of allMessages) {
          if (!m.id) continue;
          try {
            const full = await gmail.users.messages.get({ userId: 'me', id: m.id, format: 'full' });
            const body = getMessageText(full.data);
            if (!body) continue;

            const prompt = `Extract Departure, Arrival, Status from the following email. Return JSON with keys \"Departure\" ({time: <ISO>, tz: <IANA>}), \"Arrival\" ({time: <ISO>, tz: <IANA>}), and \"Status\" (ENTRY or EXIT).\n${body}`;
            const aiRes = await model.generateContent(prompt);
            const text = aiRes.response.text().trim();

            let parsed: any;
            try {
              parsed = JSON.parse(text);
            } catch (e) {
              functions.logger.warn('Invalid JSON from AI', { userId, messageId: m.id, text });
              hasErrors = true;
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
              functions.logger.info('Imported travel event', { userId, occurredAt: event.occurredAt });
            } else {
              functions.logger.info('Duplicate event skipped', { userId, occurredAt: event.occurredAt });
            }
          } catch (err) {
            hasErrors = true;
            functions.logger.error('Error processing message', { userId, messageId: m.id, err });
          }
        }

        if (!hasErrors) {
          await tokenRef.set({ lastSync: runAt }, { merge: true });
        }
      } catch (err) {
        functions.logger.error('Error processing user', { userId, err });
      }
    };

    await Promise.allSettled(usersSnap.docs.map(processUser));
  });
