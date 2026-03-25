import React from 'react';

interface BotAvatarProps {
  name: string;
  icon: string;
  style: 'TAG' | 'LAG' | 'Nit' | 'Fish' | 'GTO';
  size?: 'sm' | 'md';
}

const styleColors: Record<BotAvatarProps['style'], string> = {
  TAG: 'bg-red-500/20 text-red-400 border-red-500/30',
  LAG: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Nit: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Fish: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  GTO: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const BotAvatar: React.FC<BotAvatarProps> = ({
  name,
  icon,
  style,
  size = 'md',
}) => {
  const isMd = size === 'md';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`flex items-center justify-center rounded-full bg-[#334155] border border-gray-600 select-none ${
          isMd ? 'w-12 h-12 text-2xl' : 'w-8 h-8 text-lg'
        }`}
      >
        {icon}
      </div>
      <span
        className={`font-medium text-gray-100 ${
          isMd ? 'text-sm' : 'text-xs'
        }`}
      >
        {name}
      </span>
      <span
        className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md border ${styleColors[style]}`}
      >
        {style}
      </span>
    </div>
  );
};

export default BotAvatar;