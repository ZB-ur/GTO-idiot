'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface AllInConfirmDialogProps {
  open: boolean;
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AllInConfirmDialog({
  open,
  amount,
  onConfirm,
  onCancel,
}: AllInConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={onCancel} />

          {/* Dialog */}
          <motion.div
            className="relative bg-gray-800 rounded-xl border border-gray-700 shadow-xl p-6 max-w-sm w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Warning icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>

            <h3 className="text-white text-lg font-bold text-center mb-2">
              Go All In?
            </h3>
            <p className="text-gray-400 text-sm text-center mb-1">
              You are about to go all in for
            </p>
            <p className="text-yellow-400 text-2xl font-mono font-bold text-center mb-6">
              {amount.toLocaleString()} BB
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-700 text-gray-300 font-semibold text-sm hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-colors active:scale-95"
              >
                All In!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}