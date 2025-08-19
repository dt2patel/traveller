import { useState } from 'react';
import { sendLink } from '../lib/auth';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-xl mb-4">Sign in</h1>
      {sent ? (
        <p>Check your email for a sign-in link.</p>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await sendLink(email);
            setSent(true);
          }}
          className="space-y-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full"
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
            Send Link
          </button>
        </form>
      )}
    </div>
  );
}
