import React from 'react';

export type BoardTexture =
  | 'high_rainbow_disconnected'
  | 'high_rainbow_connected'
  | 'high_monotone'
  | 'high_twotone_disconnected'
  | 'high_twotone_connected'
  | 'low_rainbow_disconnected'
  | 'low_rainbow_connected'
  | 'low_monotone'
  | 'low_twotone_disconnected'
  | 'low_twotone_connected'
  | 'mixed_rainbow'
  | 'mixed_twotone'
  | 'mixed_monotone';

interface TextureGroup {
  label: string;
  options: { value: BoardTexture; label: string }[];
}

const TEXTURE_GROUPS: TextureGroup[] = [
  {
    label: '高牌面',
    options: [
      { value: 'high_rainbow_disconnected', label: '彩虹断裂' },
      { value: 'high_rainbow_connected', label: '彩虹连接' },
      { value: 'high_twotone_disconnected', label: '双色断裂' },
      { value: 'high_twotone_connected', label: '双色连接' },
      { value: 'high_monotone', label: '同花' },
    ],
  },
  {
    label: '低牌面',
    options: [
      { value: 'low_rainbow_disconnected', label: '彩虹断裂' },
      { value: 'low_rainbow_connected', label: '彩虹连接' },
      { value: 'low_twotone_disconnected', label: '双色断裂' },
      { value: 'low_twotone_connected', label: '双色连接' },
      { value: 'low_monotone', label: '同花' },
    ],
  },
  {
    label: '混合牌面',
    options: [
      { value: 'mixed_rainbow', label: '彩虹' },
      { value: 'mixed_twotone', label: '双色' },
      { value: 'mixed_monotone', label: '同花' },
    ],
  },
];

interface BoardTextureSelectorProps {
  selected: BoardTexture;
  onChange: (texture: BoardTexture) => void;
}

export const BoardTextureSelector: React.FC<BoardTextureSelectorProps> = ({
  selected,
  onChange,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-600">
        牌面结构
      </label>
      <div className="space-y-3">
        {TEXTURE_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <span className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
              {group.label}
            </span>
            <div className="flex flex-wrap gap-2">
              {group.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onChange(opt.value)}
                  className={`
                    px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-150
                    ${
                      selected === opt.value
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-gray-900'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardTextureSelector;