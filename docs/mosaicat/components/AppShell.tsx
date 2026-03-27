import React, { useState, useCallback } from 'react';

// --- Types ---

export interface Toast {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  message: string;
  duration?: number;
}

export interface AppShellProps {
  children: React.ReactNode;
}

// --- Sub-components (inline for self-containment; children components are separate files) ---

interface NavBarProps {
  onOpenSettings: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onOpenSettings }) => (
  <nav className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-700">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
        <span className="text-gray-950 font-bold text-sm">G</span>
      </div>
      <span className="text-lg font-semibold text-gray-50 tracking-tight">GTO Idiot</span>
    </div>
    <div className="flex items-center gap-2">
      <a
        href="/sessions"
        className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-50 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Sessions
      </a>
      <a
        href="/hands"
        className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-50 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Hand History
      </a>
      <a
        href="/stats"
        className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-50 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Stats
      </a>
      <button
        onClick={onOpenSettings}
        className="ml-2 p-2 text-gray-400 hover:text-gray-50 rounded-lg hover:bg-gray-800 transition-colors"
        aria-label="Settings"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.212-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      </button>
    </div>
  </nav>
);

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [gameSpeed, setGameSpeed] = useState<'fast' | 'normal' | 'slow'>('normal');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [handStrengthEnabled, setHandStrengthEnabled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const handleSave = async () => {
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameSpeed,
        soundEnabled,
        handStrengthIndicatorEnabled: handStrengthEnabled,
        theme,
      }),
    });
    if (res.ok) onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-700 z-50 shadow-lg shadow-black/40 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-50">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-50 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Game Speed */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-50">Game Speed</label>
            <div className="flex gap-2">
              {(['fast', 'normal', 'slow'] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => setGameSpeed(speed)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors capitalize ${
                    gameSpeed === speed
                      ? 'bg-amber-500 text-gray-950 border-amber-500 font-semibold'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-50">Sound Effects</label>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                soundEnabled ? 'bg-emerald-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Hand Strength Indicator */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-50">Hand Strength Indicator</label>
            <button
              onClick={() => setHandStrengthEnabled(!handStrengthEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                handStrengthEnabled ? 'bg-emerald-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  handStrengthEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-50">Theme</label>
            <div className="flex gap-2">
              {(['dark', 'light'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors capitalize ${
                    theme === t
                      ? 'bg-amber-500 text-gray-950 border-amber-500 font-semibold'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-700">
          <button
            onClick={handleSave}
            className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold text-sm rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const toastStyles: Record<Toast['type'], string> = {
  success: 'border-emerald-400 bg-emerald-400/10 text-emerald-400',
  warning: 'border-amber-400 bg-amber-400/10 text-amber-400',
  danger: 'border-red-500 bg-red-500/10 text-red-400',
  info: 'border-sky-400 bg-sky-400/10 text-sky-400',
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg shadow-black/40 ${toastStyles[toast.type]}`}
      >
        <span className="text-sm flex-1">{toast.message}</span>
        <button
          onClick={() => onDismiss(toast.id)}
          className="p-0.5 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    ))}
  </div>
);

// --- AppShell ---

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-50 flex flex-col">
      <NavBar onOpenSettings={() => setSettingsOpen(true)} />
      <main className="flex-1 relative">{children}</main>
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default AppShell;