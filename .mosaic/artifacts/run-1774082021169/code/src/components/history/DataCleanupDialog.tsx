import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Spinner } from '../shared/Spinner';
import { clearOldHands } from '../../services/storage-service';

interface DataCleanupDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onComplete: () => void;
}

const PRESETS = [
  { label: 'Older than 7 days', days: 7 },
  { label: 'Older than 30 days', days: 30 },
  { label: 'Older than 90 days', days: 90 },
] as const;

export function DataCleanupDialog({ isOpen, onClose, onComplete }: DataCleanupDialogProps) {
  const [selectedDays, setSelectedDays] = useState(30);
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<{ deletedCount: number; remainingCount: number; freedBytes: number } | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setResult(null);
    try {
      const olderThan = new Date(Date.now() - selectedDays * 24 * 60 * 60 * 1000).toISOString();
      const res = await clearOldHands(olderThan);
      setResult(res);
      onComplete();
    } catch {
      // Error handling silently
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cleanup Old Data" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          Delete old hand records to free up storage space. This action cannot be undone.
        </p>

        <div className="space-y-2">
          {PRESETS.map(preset => (
            <label
              key={preset.days}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                selectedDays === preset.days
                  ? 'border-felt-500 bg-felt-900/30'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <input
                type="radio"
                name="cleanup-days"
                value={preset.days}
                checked={selectedDays === preset.days}
                onChange={() => setSelectedDays(preset.days)}
                className="accent-felt-500"
              />
              <span className="text-sm text-gray-300">{preset.label}</span>
            </label>
          ))}
        </div>

        {result && (
          <div className="rounded-md border border-green-700/30 bg-green-900/20 px-3 py-2 text-sm text-green-400">
            Deleted {result.deletedCount} hands.
            {result.freedBytes > 0 && ` Freed ${(result.freedBytes / 1024 / 1024).toFixed(2)} MB.`}
            {' '}{result.remainingCount} hands remaining.
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700"
          >
            {result ? 'Done' : 'Cancel'}
          </button>
          {!result && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-50"
            >
              {isDeleting && <Spinner size="sm" />}
              Delete
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
