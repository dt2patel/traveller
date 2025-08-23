import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';

describe('Firestore security rules', () => {
  let testEnv: any;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-test',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it('allows users to access their own events', async () => {
    const userDb = testEnv.authenticatedContext('alice').firestore();
    const ref = userDb.collection('users').doc('alice').collection('events').doc('event1');
    await assertSucceeds(ref.set({ created: true }));
    await assertSucceeds(ref.get());
  });

  it('denies users from accessing other users events', async () => {
    const userDb = testEnv.authenticatedContext('alice').firestore();
    const ref = userDb.collection('users').doc('bob').collection('events').doc('event1');
    await assertFails(ref.set({ created: true }));
    await assertFails(ref.get());
  });

  it('allows cloud functions service account writes', async () => {
    const functionDb = testEnv.authenticatedContext('serviceAccount', {
      firebase: { sign_in_provider: 'firebase' },
    }).firestore();
    const ref = functionDb.collection('users').doc('bob').collection('events').doc('event1');
    await assertSucceeds(ref.set({ created: true }));
  });
});
