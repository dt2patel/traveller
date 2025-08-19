interface Props {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, message, onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-4 rounded w-64">
        <p className="mb-4 text-sm">{message}</p>
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel}>Cancel</button>
          <button className="text-red-600" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
