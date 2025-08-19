
import React from 'react';
import { format, parse } from 'date-fns';

interface DateTimePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ label, value, onChange }) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const datePart = e.target.value;
    const timePart = format(value, 'HH:mm');
    const newDate = parse(`${datePart} ${timePart}`, 'yyyy-MM-dd HH:mm', new Date());
    onChange(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timePart = e.target.value;
    const datePart = format(value, 'yyyy-MM-dd');
    const newDate = parse(`${datePart} ${timePart}`, 'yyyy-MM-dd HH:mm', new Date());
    onChange(newDate);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex space-x-2">
        <input
          type="date"
          value={format(value, 'yyyy-MM-dd')}
          onChange={handleDateChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
        />
        <input
          type="time"
          value={format(value, 'HH:mm')}
          onChange={handleTimeChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
        />
      </div>
    </div>
  );
};

export default DateTimePicker;
