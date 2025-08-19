import { InputHTMLAttributes } from 'react';

function DateTimePicker(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="datetime-local" className="border p-2" {...props} />;
}

export default DateTimePicker;