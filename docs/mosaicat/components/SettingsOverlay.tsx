import React from 'react';

interface SettingsOverlayProps {
  open: boolean;
  onClose: () => void;
  settings: {
    language: string;
    botSpeed: string;
    defaultBuyIn: number;
  };
  onSettingsChange: (key: string, value: any) => void;
  canChangeSeat: boolean;
  onChangeSeat?: () => void;
  onClearData: () => void;
}

const SPEED_OPTIONS = [
  { key: 'slow', label: 'Slow', desc: '2000ms' },
  { key: 'normal', label: 'Normal', desc: '1000ms' },
  { key: 'fast', label: 'Fast', desc: '300ms' },
];

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({
  open,
  onClose,
  settings,
  onSettingsChange,
  canChangeSeat,
  onChangeSeat,
  onClearData,
}) => {
  const [confirmClear, setConfirmClear] = React.useState(false);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-xl border border-gray-700 shadow-xl overflow-hidden"
          style={{ background: '#1e293b' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h2 className="text-gray-100 text-lg font-semibold">Settings</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-6">
            {/* Language Toggle */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">Language / 语言</label>
              <div className="flex gap-2">
                <button
                  onClick={() => onSettingsChange('language', 'en')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings.language === 'en'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => onSettingsChange('language', 'zh')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings.language === 'zh'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  中文
                </button>
              </div>
            </div>

            {/* Bot Speed */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">Bot Speed</label>
              <div className="flex gap-2">
                {SPEED_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => onSettingsChange('botSpeed', opt.key)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex flex-col items-center ${
                      settings.botSpeed === opt.key
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-xs opacity-60">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Default Buy-In */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">
                Default Buy-In: <span className="text-emerald-400">{settings.defaultBuyIn} BB</span>
              </label>
              <input
                type="range"
                min={50}
                max={200}
                step={10}
                value={settings.defaultBuyIn}
                onChange={(e) => onSettingsChange('defaultBuyIn', Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50 BB</span>
                <span>200 BB</span>
              </div>
            </div>

            {/* Change Seat */}
            {canChangeSeat && onChangeSeat && (
              <div>
                <button
                  onClick={onChangeSeat}
                  className="w-full py-2.5 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors border border-gray-700"
                >
                  Change Seat Position
                </button>
              </div>
            )}

            {/* Clear Data */}
            <div className="pt-2 border-t border-gray-700">
              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="w-full py-2.5 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors border border-red-500/20"
                >
                  Clear All Data
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-red-400 text-xs text-center">This will permanently delete all your game data.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="flex-1 py-2 rounded-lg bg-gray-800 text-gray-400 text-sm font-medium hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onClearData();
                        setConfirmClear(false);
                      }}
                      className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsOverlay;