import React, { useState, useCallback } from 'react';

// === Types ===
type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
type AnimationSpeed = 'slow' | 'normal' | 'fast';

interface BotActionDelay {
  min: number;
  max: number;
}

interface UserSettings {
  defaultSeatPosition?: Position;
  defaultStartingStack?: number;
  animationSpeed?: AnimationSpeed;
  botActionDelay?: BotActionDelay;
}

interface StorageInfo {
  totalHands: number;
  usedBytes: number;
  usedMB?: number;
  hasWarning: boolean;
  warningMessage?: string;
  oldestHandDate?: string;
}

interface SettingsPanelProps {
  settings: UserSettings;
  storageInfo: StorageInfo;
  onUpdateSettings: (settings: UserSettings) => void;
  onClearData: (olderThan: string) => void;
}

// === Sub-components ===

interface StorageInfoCardProps {
  storageInfo: StorageInfo;
  onOpenCleanup: () => void;
}

function StorageInfoCard({ storageInfo, onOpenCleanup }: StorageInfoCardProps) {
  const usageMB = storageInfo.usedMB ?? (storageInfo.usedBytes / (1024 * 1024));
  const usagePercent = Math.min((usageMB / 50) * 100, 100);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Storage</h3>
        {storageInfo.hasWarning && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Warning
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-gray-600">Total Hands</span>
          <span className="text-base font-semibold text-gray-900">{storageInfo.totalHands.toLocaleString()}</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-gray-600">Storage Used</span>
            <span className="text-sm font-medium text-gray-900">{usageMB.toFixed(1)} MB / 50 MB</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                storageInfo.hasWarning ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        {storageInfo.oldestHandDate && (
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-gray-600">Oldest Record</span>
            <span className="text-sm text-gray-900">
              {new Date(storageInfo.oldestHandDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {storageInfo.hasWarning && storageInfo.warningMessage && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3">
            {storageInfo.warningMessage}
          </p>
        )}
      </div>

      <button
        onClick={onOpenCleanup}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
        Clean Up Old Data
      </button>
    </div>
  );
}

interface DataCleanupDialogProps {
  open: boolean;
  storageInfo: StorageInfo;
  onConfirm: (olderThan: string) => void;
  onCancel: () => void;
}

function DataCleanupDialog({ open, storageInfo, onConfirm, onCancel }: DataCleanupDialogProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  if (!open) return null;

  const periods = [
    { value: '7d', label: 'Older than 7 days' },
    { value: '30d', label: 'Older than 30 days' },
    { value: '90d', label: 'Older than 90 days' },
    { value: '180d', label: 'Older than 6 months' },
    { value: 'all', label: 'Delete all records' },
  ];

  const getOlderThanDate = (period: string): string => {
    const now = new Date();
    const days: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '180d': 180, 'all': 36500 };
    now.setDate(now.getDate() - (days[period] ?? 30));
    return now.toISOString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 w-full max-w-md mx-4 p-6 space-y-5">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">Clean Up Data</h3>
          <p className="text-sm text-gray-600">
            Delete old hand records to free up storage. This action cannot be undone.
          </p>
        </div>

        <div className="space-y-2">
          {periods.map((p) => (
            <label
              key={p.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedPeriod === p.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="cleanup-period"
                value={p.value}
                checked={selectedPeriod === p.value}
                onChange={() => setSelectedPeriod(p.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className={`text-sm ${
                selectedPeriod === p.value ? 'font-medium text-gray-900' : 'text-gray-700'
              }`}>
                {p.label}
              </span>
            </label>
          ))}
        </div>

        {selectedPeriod === 'all' && (
          <p className="text-xs text-rose-600 bg-rose-50 rounded-lg p-3">
            ⚠ This will permanently delete all {storageInfo.totalHands.toLocaleString()} hand records.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(getOlderThanDate(selectedPeriod))}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
          >
            Delete Records
          </button>
        </div>
      </div>
    </div>
  );
}

// === Main Component ===

const POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
const ANIMATION_SPEEDS: { value: AnimationSpeed; label: string }[] = [
  { value: 'slow', label: 'Slow' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' },
];

export default function SettingsPanel({
  settings,
  storageInfo,
  onUpdateSettings,
  onClearData,
}: SettingsPanelProps) {
  const [cleanupOpen, setCleanupOpen] = useState(false);

  const updateField = useCallback(
    <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
      onUpdateSettings({ ...settings, [key]: value });
    },
    [settings, onUpdateSettings]
  );

  const updateBotDelay = useCallback(
    (field: 'min' | 'max', value: number) => {
      const current = settings.botActionDelay ?? { min: 500, max: 1500 };
      onUpdateSettings({
        ...settings,
        botActionDelay: { ...current, [field]: value },
      });
    },
    [settings, onUpdateSettings]
  );

  const handleClearData = useCallback(
    (olderThan: string) => {
      onClearData(olderThan);
      setCleanupOpen(false);
    },
    [onClearData]
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-600">Configure your game preferences and manage data.</p>
      </div>

      {/* Game Defaults */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h3 className="text-lg font-semibold text-gray-900">Game Defaults</h3>

        <div className="space-y-4">
          {/* Default Seat Position */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Default Seat Position</label>
            <div className="grid grid-cols-6 gap-2">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() => updateField('defaultSeatPosition', pos)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    settings.defaultSeatPosition === pos
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Default Starting Stack */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Default Starting Stack (BB)</label>
            <input
              type="number"
              min={20}
              max={500}
              value={settings.defaultStartingStack ?? 100}
              onChange={(e) => updateField('defaultStartingStack', Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <p className="text-xs text-gray-400">Range: 20 – 500 BB</p>
          </div>
        </div>
      </div>

      {/* Animation & Timing */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h3 className="text-lg font-semibold text-gray-900">Animation & Timing</h3>

        <div className="space-y-4">
          {/* Animation Speed */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Animation Speed</label>
            <div className="grid grid-cols-3 gap-2">
              {ANIMATION_SPEEDS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateField('animationSpeed', value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    (settings.animationSpeed ?? 'normal') === value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* BOT Action Delay */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">BOT Action Delay</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-gray-400">Min (ms)</span>
                <input
                  type="number"
                  min={0}
                  max={5000}
                  step={100}
                  value={settings.botActionDelay?.min ?? 500}
                  onChange={(e) => updateBotDelay('min', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-400">Max (ms)</span>
                <input
                  type="number"
                  min={0}
                  max={5000}
                  step={100}
                  value={settings.botActionDelay?.max ?? 1500}
                  onChange={(e) => updateBotDelay('max', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              BOT actions will be delayed by a random amount between min and max.
            </p>
          </div>
        </div>
      </div>

      {/* Storage Info */}
      <StorageInfoCard
        storageInfo={storageInfo}
        onOpenCleanup={() => setCleanupOpen(true)}
      />

      {/* Data Cleanup Dialog */}
      <DataCleanupDialog
        open={cleanupOpen}
        storageInfo={storageInfo}
        onConfirm={handleClearData}
        onCancel={() => setCleanupOpen(false)}
      />
    </div>
  );
}