'use client';

import { useState } from 'react';
import type { Street } from '@/engine/types';
import ImprovementTip from './ImprovementTip';

interface LeakEntry {
  frameIndex: number;
  street: Street;
  leakType: string;
  evLossBB: number;
  suggestion: string;
  description?: string;
}

interface LeakCardProps {
  leak: LeakEntry;
  rank: number;
  onClick?: (frameIndex: number) => void;
}

const LEAK_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  'Over-folding': { bg: 'bg-gray-500/20', text: 'text-gray-300' },
  'Under-bluffing': { bg: 'bg-purple-500/20', text: 'text-purple-300' },
  'Sizing error': { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
  'Missed value': { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  'Bad call': { bg: 'bg-red-500/20', text: 'text-red-300' },
};

export default function LeakCard({ leak, rank, onClick }: LeakCardProps) {
  const typeColor = LEAK_TYPE_COLORS[leak.leakType] ?? { bg: 'bg-gray-500/20', text: 'text-gray-300' };

  return (
    <div
      className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start gap-3">
        {/* Rank */}
        <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
          <span className="text-gray-300 text-xs font-bold">#{rank}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {/* Leak type tag */}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${typeColor.bg} ${typeColor.text}`}>
              {leak.leakType}
            </span>

            {/* Street */}
            <span className="text-gray-500 text-[10px] uppercase">{leak.street}</span>

            {/* EV loss */}
            <span className="text-red-400 text-xs font-mono font-bold ml-auto">
              -{leak.evLossBB.toFixed(2)} BB
            </span>
          </div>

          {/* Description */}
          {leak.description && (
            <p className="text-gray-400 text-sm mb-2">{leak.description}</p>
          )}

          {/* Improvement tip */}
          <ImprovementTip suggestion={leak.suggestion} />

          {/* Jump to frame */}
          {onClick && (
            <button
              type="button"
              onClick={() => onClick(leak.frameIndex)}
              className="mt-2 text-blue-400 text-xs hover:text-blue-300 transition-colors"
            >
              View in replay →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}