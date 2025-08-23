import { describe, it, expect, vi, beforeEach, afterAll, beforeAll } from 'vitest';
import firebaseFunctionsTest from 'firebase-functions-test';

vi.mock('firebase-admin', () => ({
  initializeApp: vi.fn(),
  firestore: vi.fn(),
}));

vi.mock('../src/gmailAuth', () => ({
  createOAuth2Client: vi.fn(),
}));

import * as admin from 'firebase-admin';
import { createOAuth2Client } from '../src/gmailAuth';

const fft = firebaseFunctionsTest();
let exchangeGmailCode: any;

describe('exchangeGmailCode', () => {
  beforeAll(async () => {
    process.env.GEMINI_API_KEY = 'test';
    ({ exchangeGmailCode } = await import('../src/index'));
  });

  afterAll(() => {
    fft.cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores tokens and returns success', async () => {
    const getToken = vi.fn().mockResolvedValue({
      tokens: { refresh_token: 'r', access_token: 'a', expiry_date: 123 },
    });
    (createOAuth2Client as unknown as vi.Mock).mockReturnValue({ getToken });

    const set = vi.fn().mockResolvedValue(undefined);
    (admin.firestore as unknown as vi.Mock).mockReturnValue({
      collection: vi.fn().mockReturnValue({
        doc: vi.fn().mockReturnValue({
          collection: vi.fn().mockReturnValue({
            doc: vi.fn().mockReturnValue({ set }),
          }),
        }),
      }),
    });

    const wrapped = fft.wrap(exchangeGmailCode);
    const res = await wrapped({ authCode: 'code' }, { auth: { uid: 'uid' } });

    expect(getToken).toHaveBeenCalledWith('code');
    expect(set).toHaveBeenCalledWith({
      refreshToken: 'r',
      accessToken: 'a',
      tokenExpiry: 123,
    });
    expect(res).toEqual({ success: true });
  });

  it('fails for unauthenticated users', async () => {
    const wrapped = fft.wrap(exchangeGmailCode);
    await expect(wrapped({ authCode: 'code' })).rejects.toMatchObject({ code: 'unauthenticated' });
  });

  it('fails for invalid input', async () => {
    const wrapped = fft.wrap(exchangeGmailCode);
    await expect(wrapped({}, { auth: { uid: 'uid' } })).rejects.toMatchObject({ code: 'invalid-argument' });
  });

  it('fails when Google returns incomplete tokens', async () => {
    (createOAuth2Client as unknown as vi.Mock).mockReturnValue({
      getToken: vi.fn().mockResolvedValue({ tokens: {} }),
    });
    const wrapped = fft.wrap(exchangeGmailCode);
    await expect(wrapped({ authCode: 'code' }, { auth: { uid: 'uid' } })).rejects.toMatchObject({ code: 'internal' });
  });

  it('fails when token exchange throws', async () => {
    (createOAuth2Client as unknown as vi.Mock).mockReturnValue({
      getToken: vi.fn().mockRejectedValue(new Error('boom')),
    });
    const wrapped = fft.wrap(exchangeGmailCode);
    await expect(wrapped({ authCode: 'code' }, { auth: { uid: 'uid' } })).rejects.toMatchObject({ code: 'internal' });
  });
});
