import { useState } from 'react';
import { sendLoginLink } from '../lib/auth';
import { toast } from 'react-toastify';

function Auth() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const handleSend = async () => {
    try {
      await sendLoginLink(email);
      setSent(true);
      toast.success('Sign-in link sent');
    } catch (e) {
      toast.error('Error sending link');
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="border p-2 mb-4" aria-label="Email" />
      <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2">Send Sign-in Link</button>
      {sent && <p className="mt-2">Check your email for the link.</p>}
    </div>
  );
}

export default Auth;