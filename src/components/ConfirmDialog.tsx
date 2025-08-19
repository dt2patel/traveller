function ConfirmDialog({ open, onConfirm, onCancel, message }: { open: boolean; onConfirm: () => void; onCancel: () => void; message: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded">
        <p>{message}</p>
        <div className="space-x-2">
          <button onClick={onConfirm} className="bg-green-500 text-white px-2 py-1">Yes</button>
          <button onClick={onCancel} className="bg-red-500 text-white px-2 py-1">No</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;