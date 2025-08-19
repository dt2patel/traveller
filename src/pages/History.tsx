
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import EventRow from '@/components/EventRow';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ConfirmDialog';
import { generateCSV } from '@/lib/utils';
import toast from 'react-hot-toast';

const History: React.FC = () => {
  const { events, isLoading, deleteEvent } = useEvents();
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (eventToDelete) {
      try {
        await deleteEvent(eventToDelete);
        toast.success('Event deleted.');
      } catch (error) {
        toast.error('Failed to delete event.');
      } finally {
        setEventToDelete(null);
      }
    }
  };

  const handleExport = () => {
    generateCSV(events, {});
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Travel History</h1>
        {events.length > 0 && (
          <Button onClick={handleExport} size="sm" variant="secondary">
            Export CSV
          </Button>
        )}
      </div>

      {isLoading && <div className="text-center p-8">Loading events...</div>}
      
      {!isLoading && events.length === 0 && (
        <EmptyState
          title="No travel history"
          message="Get started by logging your first entry or exit."
          action={<Link to="/"><Button>Log First Event</Button></Link>}
        />
      )}

      {!isLoading && events.length > 0 && (
        <div className="space-y-3">
          {events.map(event => (
            <EventRow key={event.id} event={event} onDelete={() => setEventToDelete(event.id)} />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        confirmText="Delete"
      >
        Are you sure you want to delete this event? This action cannot be undone.
      </ConfirmDialog>
    </div>
  );
};

export default History;
