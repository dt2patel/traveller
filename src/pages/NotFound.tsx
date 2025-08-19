
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

const NotFound: React.FC = () => {
  return (
    <div className="text-center py-16 px-4">
      <h1 className="text-4xl font-bold text-brand-primary">404</h1>
      <h2 className="mt-2 text-2xl font-semibold text-gray-800">Page Not Found</h2>
      <p className="mt-4 text-gray-600">
        Sorry, the page you are looking for does not exist.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button>Go Back Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
