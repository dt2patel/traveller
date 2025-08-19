
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import { useVibration } from '@/hooks/useVibration';
import Button from '@/components/ui/Button';
import DateTimePicker from '@/components/DateTimePicker';
import { EventType, TravelEvent } from '@/types';
import toast from 'react-hot-toast';

const CustomEntry: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, addEvent, updateEvent, isLoading } = useEvents();
  const vibrate = useVibration();

  const [type, setType] = useState<EventType>('ENTRY');
  const [occurredAt, setOccurredAt] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      const eventToEdit = events.find(e => e.id === id);
      if (eventToEdit) {
        setIsEditing(true);
        setType(eventToEdit.type);
        setOccurredAt(new Date(eventToEdit.occurredAt));
        setNotes(eventToEdit.notes || '');
      }
    }
  }, [id, events]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      type,
      occurredAt: occurredAt.toISOString(),
      occurredTz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      source: 'custom' as const,
      notes,
    };
    
    try {
      if (isEditing && id) {
        await updateEvent({ id, ...eventData });
        toast.success('Event updated successfully!');
      } else {
        await addEvent(eventData);
        toast.success('Event added successfully!');
      }
      vibrate();
      navigate('/history');
    } catch (error) {
      toast.error('Failed to save event.');
      console.error(error);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Edit Event' : 'Add Custom Event'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-200 p-1">
            <button
              type="button"
              onClick={() => setType('ENTRY')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${type === 'ENTRY' ? 'bg-white text-green-700 shadow' : 'text-gray-600'}`}
            >
              ENTRY
            </button>
            <button
              type="button"
              onClick={() => setType('EXIT')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${type === 'EXIT' ? 'bg-white text-red-700 shadow' : 'text-gray-600'}`}
            >
              EXIT
            </button>
          </div>
        </div>

        <DateTimePicker label="Date & Time" value={occurredAt} onChange={setOccurredAt} />

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
            placeholder="e.g., Flight AI-102"
          />
        </div>

        <div className="flex space-x-2 pt-4">
          <Button type="submit" isLoading={isLoading} className="w-full">
            {isEditing ? 'Save Changes' : 'Add Event'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="w-full">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomEntry;
