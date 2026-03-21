'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface DataCleanupDialogProps {
  open: boolean;
  oldestHandDate?: string;
  totalHands: number;
  onConfirmDelete: (olderThan: string) => void;
  onCancel: () => void;
}

const PRESET_RANGES = [
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: '6 months', days: 180 },
  { label: '1 year', days: 365 },
];

export default function DataCleanupDialog({
  open,
  oldestHandDate,
  totalHands,
  onConfirmDelete,
  onCancel,
}: DataCleanupDialogProps) {
  const [selectedDays, setSelectedDays] = useState(90);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - selectedDays);
  const cutoffIso = cutoffDate.toISOString();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
          <motion.div
            className="relative bg-gray-800 rounded-xl border border-gray-700 shadow-xl p-6 max-w-md w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <h3 className="text-white text-lg font-bold mb-2">Clean Up Hand Data</h3>
            <p className="text-gray-400 text-sm mb-4">
              Delete hands older than a selected period. You currently have{' '}
              <span className="text-white font-mono">{totalHands.toLocaleString()}</span> hands
              {oldestHandDate && (
                <>, oldest from {new Date(oldestHandDate).toLocaleDateString()}</>
              )}
              .
            </p>

            {/* Preset buttons */}
            <div className="flex gap-2 mb-4">
              {PRESET_RANGES.map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => setSelectedDays(preset.days)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDays === preset.days
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <p className="text-gray-500 text-xs mb-4">
              This will delete all hands older than{' '}
              <span className="text-gray-300">{cutoffDate.toLocaleDateString()}</span>. This action cannot be undone.
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
                onClick={() => onConfirmDelete(cutoffIso)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-colors"
              >
                Delete Old Hands
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}