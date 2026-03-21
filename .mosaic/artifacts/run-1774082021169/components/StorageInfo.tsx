'use client';

interface StorageInfoData {
  totalHands: number;
  usedBytes: number;
  usedMB?: number;
  hasWarning: boolean;
  warningMessage?: string;
  oldestHandDate?: string;
}

interface StorageInfoProps {
  info: StorageInfoData;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StorageInfo({ info, className = '' }: StorageInfoProps) {
  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 p-4 ${className}`}>
      <h4 className="text-gray-200 text-sm font-semibold mb-3">Storage</h4>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400 text-sm">Total Hands</span>
          <span className="text-white font-mono text-sm">{info.totalHands.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400 text-sm">Storage Used</span>
          <span className="text-white font-mono text-sm">{formatBytes(info.usedBytes)}</span>
        </div>

        {info.oldestHandDate && (
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Oldest Hand</span>
            <span className="text-gray-300 text-sm">{new Date(info.oldestHandDate).toLocaleDateString()}</span>
          </div>
        )}

        {/* Storage bar */}
        <div className="mt-2">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${info.hasWarning ? 'bg-amber-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min((info.usedBytes / (50 * 1024 * 1024)) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-500 text-[10px]">0 MB</span>
            <span className="text-gray-500 text-[10px]">50 MB</span>
          </div>
        </div>

        {/* Warning */}
        {info.hasWarning && info.warningMessage && (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mt-2">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-amber-400 text-xs">{info.warningMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}