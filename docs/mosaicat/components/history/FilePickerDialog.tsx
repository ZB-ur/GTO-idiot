'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilePickerDialogProps {
  isOpen: boolean;
  onFileSelected: (file: File) => void;
  onClose: () => void;
  accept?: string;
}

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

export function FilePickerDialog({
  isOpen,
  onFileSelected,
  onClose,
  accept = '.json',
}: FilePickerDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setValidationState('idle');
    setErrorMessage(null);
    setDragActive(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const validateFile = useCallback(async (file: File) => {
    setSelectedFile(file);
    setValidationState('validating');
    setErrorMessage(null);

    // Basic validations
    if (!file.name.endsWith('.json')) {
      setValidationState('invalid');
      setErrorMessage('Only JSON files are accepted.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setValidationState('invalid');
      setErrorMessage('File exceeds 10 MB limit.');
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.version || !Array.isArray(data.hands)) {
        setValidationState('invalid');
        setErrorMessage('Invalid format: missing "version" or "hands" array.');
        return;
      }

      setValidationState('valid');
    } catch {
      setValidationState('invalid');
      setErrorMessage('File is not valid JSON.');
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateFile(file);
    },
    [validateFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) validateFile(file);
    },
    [validateFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const handleImport = useCallback(() => {
    if (selectedFile && validationState === 'valid') {
      onFileSelected(selectedFile);
      resetState();
    }
  }, [selectedFile, validationState, onFileSelected, resetState]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="relative max-w-md w-full mx-4 bg-gray-800 rounded-xl shadow-xl border border-gray-700"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-gray-100">Import Hand History</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  dragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : validationState === 'invalid'
                      ? 'border-red-500/50 bg-red-500/5'
                      : validationState === 'valid'
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!selectedFile ? (
                  <>
                    <div className="text-3xl mb-3">📁</div>
                    <p className="text-sm text-gray-300 font-medium">
                      Drop JSON file here or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Max 10 MB</p>
                  </>
                ) : (
                  <div className="space-y-2">
                    {validationState === 'validating' && (
                      <div className="text-2xl animate-spin">⏳</div>
                    )}
                    {validationState === 'valid' && (
                      <div className="text-2xl">✅</div>
                    )}
                    {validationState === 'invalid' && (
                      <div className="text-2xl">❌</div>
                    )}
                    <p className="text-sm text-gray-200 font-medium truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                )}
              </div>

              {/* Error message */}
              {errorMessage && (
                <motion.p
                  className="mt-3 text-sm text-red-400 flex items-center gap-1.5"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {errorMessage}
                </motion.p>
              )}

              {/* Valid message */}
              {validationState === 'valid' && (
                <motion.p
                  className="mt-3 text-sm text-emerald-400 flex items-center gap-1.5"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  File validated successfully
                </motion.p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={validationState !== 'valid'}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Import
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}