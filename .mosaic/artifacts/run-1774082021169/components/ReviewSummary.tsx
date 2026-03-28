'use client';

import type { Street, ActionType } from '@/engine/types';
import LeakCard from './LeakCard';

type DecisionQuality = 'optimal' | 'good' | 'minor_mistake' | 'major_mistake';

interface LeakEntry {
  frameIndex: number;
  street: Street;
  leakType: string;
  evLossBB: number;
  suggestion: string;
  description?: string;
}

interface HandAnalysis {
  handId: string;
  overallScore: number;
  totalDecisionPoints: number;
  optimalCount: number;
  goodCount: number;
  minorMistakeCount: number;
  majorMistakeCount: number;
  totalEVLoss: number;
}

interface ReviewSummaryProps {
  analysis: HandAnalysis;
  leaks: LeakEntry[];
  onDrillDown: (frameIndex: number) => void;
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';

  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="40" fill="none" stroke="#374151" strokeWidth="6" />
        <circle
          cx="48" cy="48" r="40" fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="text-[10px] text-gray-400">GTO Score</span>
      </div>
    </div>
  );
}

export default function ReviewSummary({
  analysis,
  leaks,
  onDrillDown,
}: ReviewSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Score header */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-6">
          <ScoreRing score={analysis.overallScore} />

          <div className="flex-1 space-y-2">
            <h3 className="text-white text-lg font-bold">Hand Review</h3>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-gray-300">Optimal: {analysis.optimalCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-gray-300">Good: {analysis.goodCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="text-gray-300">Minor: {analysis.minorMistakeCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-gray-300">Major: {analysis.majorMistakeCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-gray-400 text-xs">Total EV Loss:</span>
              <span className="text-red-400 text-sm font-mono font-bold">
                -{analysis.totalEVLoss.toFixed(2)} BB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaks list */}
      {leaks.length > 0 && (
        <div>
          <h4 className="text-gray-200 text-sm font-semibold mb-3">
            Top Leaks ({leaks.length})
          </h4>
          <div className="space-y-3">
            {leaks.map((leak, i) => (
              <LeakCard
                key={i}
                leak={leak}
                rank={i + 1}
                onClick={onDrillDown}
              />
            ))}
          </div>
        </div>
      )}

      {leaks.length === 0 && (
        <div className="text-center py-8 border border-dashed border-gray-700 rounded-xl">
          <p className="text-green-400 font-semibold">Perfect play!</p>
          <p className="text-gray-500 text-sm mt-1">No significant leaks found in this hand.</p>
        </div>
      )}
    </div>
  );
}