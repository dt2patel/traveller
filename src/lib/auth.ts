import { sendSignInLinkToEmail, signInWithEmailLink, isSignInWithEmailLink, signOut as fbSignOut } from 'firebase/auth';
import { auth } from './firebase';

const actionCodeSettings = {
  url: window.location.origin,
  handleCodeInApp: true,
};

export async function sendLink(email: string) {
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem('emailForSignIn', email);
}

export async function completeSignIn() {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) email = window.prompt('Confirm your email') || '';
    await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem('emailForSignIn');
  }
}

export function signOut() {
  return fbSignOut(auth);
}
