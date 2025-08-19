import { ButtonHTMLAttributes } from 'react';

function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="bg-blue-500 text-white px-4 py-2 rounded" {...props} />;
}

export default Button;