import { auth } from './firebase';

const EMAIL_STORAGE_KEY = 'emailForSignIn';

export const sendSignInLink = async (email: string) => {
  const actionCodeSettings = {
    url: window.location.origin,
    handleCodeInApp: true,
  };
  await auth.sendSignInLinkToEmail(email, actionCodeSettings);
  window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
};

export const completeSignIn = async (url: string) => {
  if (auth.isSignInWithEmailLink(url)) {
    let email = window.localStorage.getItem(EMAIL_STORAGE_KEY);
    if (!email) {
      // User opened the link on a different device. To prevent session fixation
      // attacks, ask the user to provide the email again. For simplicity,
      // we'll prompt here, but a real app would have a dedicated UI.
      email = window.prompt('Please provide your email for confirmation');
      if (!email) throw new Error("Email is required to complete sign-in.");
    }
    const result = await auth.signInWithEmailLink(email, url);
    window.localStorage.removeItem(EMAIL_STORAGE_KEY);
    return result.user;
  }
  throw new Error("Not a valid sign-in link.");
};

export const registerWithEmailPassword = async (email: string, password: string) => {
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  return userCredential.user;
};

export const signInWithEmailPassword = async (email: string, password: string) => {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return userCredential.user;
}

export const signOut = async () => {
  await auth.signOut();
};
