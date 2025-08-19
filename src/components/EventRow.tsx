import type { Event } from '../types';
import { formatLocal, tzAbbr } from '../lib/time';

interface Props {
  event: Event;
  onEdit?: (e: Event) => void;
  onDelete?: (e: Event) => void;
}

export default function EventRow({ event, onEdit, onDelete }: Props) {
  return (
    <div className="flex justify-between items-center border-b py-2">
      <div>
        <div className="font-medium">{event.type}</div>
        <div className="text-xs text-gray-500">
          {formatLocal(event.occurredAt)}
          <span className="ml-1 px-1 border rounded">{tzAbbr(event.occurredAt)}</span>
        </div>
      </div>
      <div className="space-x-2">
        {onEdit && (
          <button className="text-blue-600" onClick={() => onEdit(event)}>
            Edit
          </button>
        )}
        {onDelete && (
          <button className="text-red-600" onClick={() => onDelete(event)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
