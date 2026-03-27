import React, { useCallback } from 'react';

type GameSpeed = 'fast' | 'normal' | 'slow';
type Theme = 'light' | 'dark';

interface UserSettings {
  gameSpeed: GameSpeed;
  soundEnabled: boolean;
  handStrengthIndicatorEnabled: boolean;
  theme: Theme;
}

interface SettingsPanelProps {
  settings: UserSettings;
  onUpdate: (key: string, value: unknown) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface RadioOption<T extends string> {
  value: T;
  label: string;
}

function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-50">{label}</label>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 border ${
              value === opt.value
                ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium text-gray-50">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
          checked ? 'bg-amber-500' : 'bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsPanel({ settings, onUpdate, isOpen, onClose }: SettingsPanelProps) {
  const handleSpeedChange = useCallback(
    (value: GameSpeed) => onUpdate('gameSpeed', value),
    [onUpdate],
  );

  const handleThemeChange = useCallback(
    (value: Theme) => onUpdate('theme', value),
    [onUpdate],
  );

  const speedOptions: RadioOption<GameSpeed>[] = [
    { value: 'fast', label: 'Fast' },
    { value: 'normal', label: 'Normal' },
    { value: 'slow', label: 'Slow' },
  ];

  const themeOptions: RadioOption<Theme>[] = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 shadow-2xl shadow-black/60 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-50">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-8 overflow-y-auto h-[calc(100%-65px)]">
          {/* Game Speed */}
          <RadioGroup
            label="Game Speed"
            options={speedOptions}
            value={settings.gameSpeed}
            onChange={handleSpeedChange}
          />

          {/* Toggles Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Gameplay
            </h3>
            <ToggleSwitch
              label="Sound Effects"
              description="Play sounds for actions and events"
              checked={settings.soundEnabled}
              onChange={(v) => onUpdate('soundEnabled', v)}
            />
            <ToggleSwitch
              label="Hand Strength Indicator"
              description="Show hand strength meter during play"
              checked={settings.handStrengthIndicatorEnabled}
              onChange={(v) => onUpdate('handStrengthIndicatorEnabled', v)}
            />
          </div>

          {/* Theme */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Appearance
            </h3>
            <RadioGroup
              label="Theme"
              options={themeOptions}
              value={settings.theme}
              onChange={handleThemeChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}