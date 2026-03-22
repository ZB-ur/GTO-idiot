'use client';

import { motion } from 'framer-motion';
import { Modal } from '@/components/common/Modal';

export interface DeviationHighlight {
  handNumber: number;
  handId: string;
  street: 'preflop' | 'flop' | 'turn' | 'river';
  evLoss: number;
  description: string;
}

export interface SessionEndSummary {
  sessionId: string;
  date: Date;
  handCount: number;
  profitLossBB: number;
  duration: number;
  gtoConformance: number;
  totalEvLoss: number;
  streetBreakdown: {
    preflop: number;
    flop: number;
    turn: number;
    river: number;
  };
  biggestDeviations: DeviationHighlight[];
}

interface SessionSummaryProps {
  summary: SessionEndSummary;
  onClose: () => void;
  onViewReview: (sessionId: string) => void;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getConformanceColor(pct: number): string {
  if (pct >= 80) return 'text-emerald-400';
  if (pct >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function getConformanceLabel(pct: number): string {
  if (pct >= 90) return 'Excellent';
  if (pct >= 80) return 'Good';
  if (pct >= 60) return 'Needs Work';
  return 'Poor';
}

function getStreetLabel(street: string): string {
  return street.charAt(0).toUpperCase() + street.slice(1);
}

function getStreetBarColor(pct: number): string {
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function SessionSummary({ summary, onClose, onViewReview }: SessionSummaryProps) {
  const isProfit = summary.profitLossBB >= 0;
  const formattedPL = `${isProfit ? '+' : ''}${summary.profitLossBB.toFixed(1)} BB`;
  const bbPerHand =
    summary.handCount > 0
      ? (summary.profitLossBB / summary.handCount).toFixed(2)
      : '0.00';

  return (
    <Modal isOpen={true} onClose={onClose} title="Session Complete" size="lg">
      <div className="space-y-5">
        {/* Result headline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center py-2"
        >
          <div
            className={`text-3xl font-bold ${
              isProfit ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {formattedPL}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {isProfit
              ? 'Nice session!'
              : "Keep studying, you'll get them next time."}
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-4 gap-2"
        >
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Hands</div>
            <div className="text-lg font-bold text-gray-100 mt-1">{summary.handCount}</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Duration</div>
            <div className="text-lg font-bold text-gray-100 mt-1">
              {formatDuration(summary.duration)}
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wide">BB/Hand</div>
            <div
              className={`text-lg font-bold mt-1 ${
                isProfit ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {bbPerHand}
            </div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wide">EV Loss</div>
            <div className="text-lg font-bold text-red-400 mt-1">
              {summary.totalEvLoss.toFixed(1)}
            </div>
          </div>
        </motion.div>

        {/* GTO Score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gray-700/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-300">GTO Conformance</h3>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getConformanceColor(summary.gtoConformance)}`}>
                {summary.gtoConformance.toFixed(0)}%
              </span>
              <span className={`text-xs ${getConformanceColor(summary.gtoConformance)}`}>
                {getConformanceLabel(summary.gtoConformance)}
              </span>
            </div>
          </div>

          {/* Street breakdown bars */}
          <div className="space-y-2">
            {(['preflop', 'flop', 'turn', 'river'] as const).map((street) => {
              const pct = summary.streetBreakdown[street];
              return (
                <div key={street} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-14">{getStreetLabel(street)}</span>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${getStreetBarColor(pct)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    />
                  </div>
                  <span className={`text-xs font-medium w-10 text-right ${getConformanceColor(pct)}`}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Biggest Deviations */}
        {summary.biggestDeviations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h3 className="text-sm font-medium text-gray-300 mb-2">Biggest Mistakes</h3>
            <div className="space-y-1.5">
              {summary.biggestDeviations.slice(0, 3).map((deviation, i) => (
                <div
                  key={deviation.handId}
                  className="flex items-center justify-between bg-gray-700/30 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-gray-500 shrink-0">#{deviation.handNumber}</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-700 text-gray-300 uppercase shrink-0">
                      {deviation.street}
                    </span>
                    <span className="text-xs text-gray-400 truncate">{deviation.description}</span>
                  </div>
                  <span className="text-xs font-medium text-red-400 shrink-0 ml-2">
                    -{deviation.evLoss.toFixed(1)} BB
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3 pt-1"
        >
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg bg-gray-700 hover:bg-gray-600
                       text-gray-200 font-medium text-sm transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => onViewReview(summary.sessionId)}
            className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-500
                       text-white font-semibold text-sm transition-colors"
          >
            Review Hands
          </button>
        </motion.div>
      </div>
    </Modal>
  );
}