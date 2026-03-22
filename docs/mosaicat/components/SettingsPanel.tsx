import React, { useCallback } from 'react';

export interface Settings {
  blindLevel: '1/2' | '2/5' | '5/10';
  startingStackBB: number;
  speed: 'fast' | 'normal' | 'slow';
  soundEnabled: boolean;
}

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: (update: Partial<Settings>) => void;
  onClearData: () => void;
}

const blindOptions = [
  { value: '1/2', label: '$1 / $2' },
  { value: '2/5', label: '$2 / $5' },
  { value: '5/10', label: '$5 / $10' },
];

const speedOptions = [
  { value: 'fast', label: 'Fast', desc: 'Instant actions' },
  { value: 'normal', label: 'Normal', desc: 'Balanced pace' },
  { value: 'slow', label: 'Slow', desc: 'With animations' },
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, onClearData }) => {
  const [confirmClear, setConfirmClear] = React.useState(false);

  const handleClearData = useCallback(() => {
    if (confirmClear) {
      onClearData();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  }, [confirmClear, onClearData]);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Game Settings */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Game Settings</h3>
          <p className="text-sm text-gray-500 mt-0.5">Configure your table setup</p>
        </div>
        <div className="p-6 space-y-5">
          {/* Blind Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blind Level</label>
            <div className="flex gap-2">
              {blindOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSettingsChange({ blindLevel: opt.value as Settings['blindLevel'] })}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                    settings.blindLevel === opt.value
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Starting Stack */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Starting Stack</label>
              <span className="text-sm font-bold text-gray-900">{settings.startingStackBB} BB</span>
            </div>
            <input
              type="range"
              min={50}
              max={200}
              step={10}
              value={settings.startingStackBB}
              onChange={(e) => onSettingsChange({ startingStackBB: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>50 BB</span>
              <span>100 BB</span>
              <span>200 BB</span>
            </div>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
          <p className="text-sm text-gray-500 mt-0.5">Customize your experience</p>
        </div>
        <div className="p-6 space-y-5">
          {/* Speed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Game Speed</label>
            <div className="space-y-2">
              {speedOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSettingsChange({ speed: opt.value as Settings['speed'] })}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    settings.speed === opt.value
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <span className={`text-sm font-medium ${settings.speed === opt.value ? 'text-blue-700' : 'text-gray-700'}`}>
                      {opt.label}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">{opt.desc}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      settings.speed === opt.value ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    }`}
                  >
                    {settings.speed === opt.value && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
            <div>
              <span className="text-sm font-medium text-gray-700">Sound Effects</span>
              <span className="text-xs text-gray-400 ml-2">Card and chip sounds</span>
            </div>
            <button
              onClick={() => onSettingsChange({ soundEnabled: !settings.soundEnabled })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  settings.soundEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage your stored hand data</p>
        </div>
        <div className="p-6">
          <div className="p-4 rounded-lg border border-red-200 bg-red-50">
            <h4 className="text-sm font-semibold text-red-700">Clear All Data</h4>
            <p className="text-xs text-red-600/70 mt-1">
              This will permanently delete all hand history. This action cannot be undone.
            </p>
            <button
              onClick={handleClearData}
              className={`mt-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                confirmClear
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
              }`}
            >
              {confirmClear ? 'Confirm Delete All' : 'Clear Data'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPanel;