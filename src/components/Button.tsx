import { ButtonHTMLAttributes } from 'react';

export default function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
