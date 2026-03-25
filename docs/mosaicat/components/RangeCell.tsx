import React from 'react';

interface RangeCellProps {
  hand: string;
  handType: 'pair' | 'suited' | 'offsuit';
  inRange: boolean;
  colorIntensity: number;
  onHover?: (hand: string) => void;
  onClick?: (hand: string) => void;
}

const typeColors: Record<string, string> = {
  pair: 'bg-amber-400',
  suited: 'bg-emerald-500',
  offsuit: 'bg-sky-500',
};

const RangeCell: React.FC<RangeCellProps> = ({
  hand,
  handType,
  inRange,
  colorIntensity,
  onHover,
  onClick,
}) => {
  const bgClass = inRange ? typeColors[handType] : 'bg-gray-700';
  const opacity = inRange ? Math.max(0.15, Math.min(1, colorIntensity)) : 1;
  const textClass = inRange ? 'text-white font-semibold' : 'text-gray-500';

  return (
    <div
      className={`w-10 h-10 flex items-center justify-center text-xs rounded-md cursor-pointer border border-gray-700/50 transition-all hover:scale-110 hover:z-10 ${textClass}`}
      style={{
        backgroundColor: inRange ? undefined : undefined,
      }}
      onMouseEnter={() => onHover?.(hand)}
      onClick={() => onClick?.(hand)}
    >
      <div
        className={`w-full h-full flex items-center justify-center rounded-md ${bgClass}`}
        style={{ opacity }}
      >
        {hand}
      </div>
    </div>
  );
};

export default RangeCell;