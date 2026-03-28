import { useState, useEffect } from 'react';
import type { StorageInfo as StorageInfoData } from '../../services/storage-service';
import { getStorageInfo } from '../../services/storage-service';

interface StorageInfoProps {
  readonly onCleanup: () => void;
}

export function StorageInfo({ onCleanup }: StorageInfoProps) {
  const [info, setInfo] = useState<StorageInfoData | null>(null);

  useEffect(() => {
    getStorageInfo().then(setInfo).catch(() => {});
  }, []);

  if (!info) return null;

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-300">Storage</h3>
          <div className="mt-1 flex items-center gap-4 text-xs text-gray-400">
            <span>{info.totalHands} hands stored</span>
            <span>{info.usedMB} MB used</span>
            {info.oldestHandDate && (
              <span>
                Oldest: {new Date(info.oldestHandDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onCleanup}
          className="rounded-md border border-gray-600 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-red-500 hover:text-red-400"
        >
          Cleanup
        </button>
      </div>

      {info.hasWarning && info.warningMessage && (
        <div className="mt-3 rounded-md border border-yellow-600/30 bg-yellow-900/20 px-3 py-2 text-xs text-yellow-400">
          {info.warningMessage}
        </div>
      )}
    </div>
  );
}
