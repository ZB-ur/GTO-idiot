'use client';

import { motion } from 'framer-motion';

interface SidePot {
  amount: number;
  eligiblePlayers: string[];
}

interface PotDisplayProps {
  pot: number;
  sidePots?: SidePot[];
}

function ChipIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`inline-block ${className}`} fill="currentColor">
      <circle cx="8" cy="8" r="7" fill="currentColor" stroke="#fff" strokeWidth="1" />
      <circle cx="8" cy="8" r="4" fill="none" stroke="#fff" strokeWidth="0.8" />
    </svg>
  );
}

export default function PotDisplay({ pot, sidePots }: PotDisplayProps) {
  if (pot === 0) return null;

  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main pot */}
      <div className="flex items-center gap-1.5 bg-black/40 rounded-full px-3 py-1">
        <ChipIcon className="w-4 h-4 text-red-500" />
        <span className="text-white font-mono text-sm font-bold">
          {pot.toLocaleString()} BB
        </span>
      </div>

      {/* Side pots */}
      {sidePots && sidePots.length > 0 && (
        <div className="flex gap-2">
          {sidePots.map((sp, i) => (
            <div
              key={i}
              className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-0.5"
            >
              <ChipIcon className="w-3 h-3 text-blue-400" />
              <span className="text-gray-300 font-mono text-xs">
                Side {i + 1}: {sp.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}