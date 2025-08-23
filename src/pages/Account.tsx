import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { startGmailAuth, sendGmailAuthCode } from '@/lib/gmail';
import { useAuth } from '@/hooks/useAuth';

const Account: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const handleConnect = () => {
    try {
      startGmailAuth();
    } catch (e) {
      toast.error('Missing Gmail configuration');
    }
  };

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (code && user) {
      setLoading(true);
      sendGmailAuthCode(code)
        .then(() => {
          toast.success('Gmail connected');
        })
        .catch((err: Error) => {
          toast.error(err.message || 'Failed to connect Gmail');
        })
        .finally(() => {
          setLoading(false);
          setSearchParams({});
        });
    } else if (error) {
      toast.error('Gmail authorization failed');
      setSearchParams({});
    }
  }, [searchParams, user, setSearchParams]);

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <Button onClick={handleConnect} isLoading={loading} className="w-full">
        Connect Gmail
      </Button>
    </div>
  );
};

export default Account;
