
import React, { useState } from 'react';
import { sendSignInLink } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendSignInLink(email);
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      toast.error('Failed to send sign-in link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to India Log
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email to receive a password-less sign-in link.
          </p>
        </div>
        {submitted ? (
          <div className="text-center p-4 bg-green-100 text-green-800 rounded-lg">
            <h3 className="font-semibold">Check your email!</h3>
            <p>A sign-in link has been sent to <span className="font-bold">{email}</span>. Click the link to complete sign-in.</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <Input
                id="email-address"
                name="email"
                type="email"
                label="Email address"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />
            </div>
            <div>
              <Button type="submit" isLoading={loading} className="w-full">
                Send Sign-In Link
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
