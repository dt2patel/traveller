import React, { useState } from 'react';
import { sendSignInLink, registerWithEmailPassword, signInWithEmailPassword } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

type AuthMode = 'signIn' | 'register';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [showPasswordless, setShowPasswordless] = useState(false);

  const handlePasswordlessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendSignInLink(email);
      setLinkSent(true);
    } catch (error) {
      console.error(error);
      toast.error('Failed to send sign-in link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        if (mode === 'register') {
            await registerWithEmailPassword(email, password);
            toast.success('Account created successfully! Please sign in.');
            setMode('signIn'); // Switch to sign-in view after registration
            setPassword('');
        } else {
            await signInWithEmailPassword(email, password);
            // onAuthStateChanged will handle navigation
        }
    } catch (error: any) {
        const errorCode = error.code;
        let message = 'An error occurred. Please try again.';
        if (errorCode === 'auth/email-already-in-use') {
            message = 'An account with this email already exists.';
        } else if (errorCode === 'auth/invalid-email') {
            message = 'Please enter a valid email address.';
        } else if (errorCode === 'auth/weak-password') {
            message = 'Password should be at least 6 characters.';
        } else if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
            message = 'Invalid email or password.';
        }
        console.error('Authentication error:', error);
        toast.error(message);
    } finally {
        setLoading(false);
    }
  };
  
  const TabButton: React.FC<{
    currentMode: AuthMode;
    targetMode: AuthMode;
    children: React.ReactNode;
  }> = ({ currentMode, targetMode, children }) => (
    <button
      onClick={() => setMode(targetMode)}
      className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg
        focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60
        ${currentMode === targetMode ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`}
    >
      {children}
    </button>
  );

  if (showPasswordless) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in with Email Link</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">Enter your email to receive a password-less sign-in link.</p>
                </div>
                {linkSent ? (
                    <div className="text-center p-4 bg-green-100 text-green-800 rounded-lg">
                        <h3 className="font-semibold">Check your email!</h3>
                        <p>A sign-in link has been sent to <span className="font-bold">{email}</span>. Click the link to complete sign-in.</p>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handlePasswordlessSubmit}>
                        <Input id="email-address-link" name="email" type="email" label="Email address" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
                        <div>
                            <Button type="submit" isLoading={loading} className="w-full">Send Sign-In Link</Button>
                        </div>
                    </form>
                )}
                 <p className="mt-2 text-center text-sm text-gray-600">
                    <button onClick={() => setShowPasswordless(false)} className="font-medium text-brand-primary hover:text-indigo-500">
                        Back to password sign-in
                    </button>
                </p>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                {mode === 'signIn' ? 'Sign in to India Log' : 'Create an Account'}
            </h2>
        </div>
        <div className="w-full max-w-md px-2 py-2 sm:px-0">
          <div className="flex space-x-1 rounded-xl bg-brand-primary/80 p-1">
            <TabButton currentMode={mode} targetMode="signIn">Sign In</TabButton>
            <TabButton currentMode={mode} targetMode="register">Register</TabButton>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuthSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
                <Input id="email-address" name="email" type="email" label="Email address" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
                <Input id="password" name="password" type="password" label="Password" autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            </div>
            <div>
                <Button type="submit" isLoading={loading} className="w-full">
                    {mode === 'signIn' ? 'Sign In' : 'Create Account'}
                </Button>
            </div>
        </form>
        <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button onClick={() => setShowPasswordless(true)} className="font-medium text-brand-primary hover:text-indigo-500">
                get a sign-in link emailed to you
            </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;