
import { Modal } from '../shared/Modal';

interface AllInConfirmDialogProps {
  readonly isOpen: boolean;
  readonly stack: number;
  readonly pot: number;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function AllInConfirmDialog({ isOpen, stack, pot, onConfirm, onCancel }: AllInConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Confirm All-In" size="sm">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-300">
          You are about to go <span className="font-bold text-red-400">ALL-IN</span> for{' '}
          <span className="font-mono font-bold text-white">{stack.toFixed(1)} BB</span> into a{' '}
          <span className="font-mono font-bold text-yellow-400">{pot.toFixed(1)} BB</span> pot.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-lg bg-gray-700 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-600">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger flex-1 py-2.5 text-sm">
            All-In
          </button>
        </div>
      </div>
    </Modal>
  );
}
