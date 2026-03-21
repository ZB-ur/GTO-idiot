
import type { SidePot } from '../../types/game';

interface PotDisplayProps {
  readonly pot: number;
  readonly sidePots?: readonly SidePot[];
}

export function PotDisplay({ pot, sidePots }: PotDisplayProps) {
  if (pot <= 0) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
        <span className="text-xs text-gray-400">Pot</span>
        <span className="font-mono text-sm font-bold text-yellow-400">{pot.toFixed(1)} BB</span>
      </div>
      {sidePots && sidePots.length > 0 && (
        <div className="flex gap-2">
          {sidePots.map((sp, i) => (
            <div key={i} className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-gray-300">
              Side #{i + 1}: {sp.amount.toFixed(1)} BB
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
