import React from 'react';

interface SessionSummary {
  sessionId: string;
  handsPlayed: number;
  netResult: number;
  gtoAlignmentScore: number;
  biggestWin: {
    handId: string;
    handNumber: number;
    amount: number;
  };
  biggestLoss: {
    handId: string;
    handNumber: number;
    amount: number;
  };
}

interface SessionSummaryPanelProps {
  summary: SessionSummary;
  onHandClick: (handId: string) => void;
  onReviewHands: () => void;
  onBackHome: () => void;
}

function NetResultDisplay({ value }: { value: number }) {
  const isPositive = value >= 0;
  const color = isPositive ? 'text-emerald-400' : 'text-red-400';
  const sign = isPositive ? '+' : '';

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-sm text-gray-400 uppercase tracking-wide">Net Result</span>
      <span className={`text-5xl font-bold ${color}`}>
        {sign}{value}
      </span>
      <span className="text-sm text-gray-500">chips</span>
    </div>
  );
}

function GTOAlignmentCircle({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-orange-400' : 'text-red-400';
  const strokeColor = score >= 70 ? '#34d399' : score >= 40 ? '#fb923c' : '#f87171';

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-gray-400 uppercase tracking-wide">GTO Alignment</span>
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="#374151"
            strokeWidth="8"
          />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{score.toFixed(1)}</span>
          <span className="text-xs text-gray-500">%</span>
        </div>
      </div>
    </div>
  );
}

interface NotableHandCardProps {
  label: string;
  handNumber: number;
  amount: number;
  handId: string;
  onClick: (handId: string) => void;
}

function NotableHandCard({ label, handNumber, amount, handId, onClick }: NotableHandCardProps) {
  const isPositive = amount >= 0;
  const amountColor = isPositive ? 'text-emerald-400' : 'text-red-400';
  const sign = isPositive ? '+' : '';
  const borderColor = isPositive ? 'border-emerald-400/20' : 'border-red-400/20';

  return (
    <button
      onClick={() => onClick(handId)}
      className={`flex items-center justify-between w-full px-4 py-3 bg-gray-800 border ${borderColor} rounded-xl hover:bg-gray-700 transition-colors cursor-pointer text-left`}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
        <span className="text-sm text-gray-50 font-medium">Hand #{handNumber}</span>
      </div>
      <span className={`text-lg font-bold ${amountColor}`}>
        {sign}{amount}
      </span>
    </button>
  );
}

export function SessionSummaryPanel({
  summary,
  onHandClick,
  onReviewHands,
  onBackHome,
}: SessionSummaryPanelProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackHome}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Home
        </button>
        <h1 className="text-lg font-semibold text-gray-50">Session Summary</h1>
        <div className="w-14" />
      </div>

      {/* Hands Played Badge */}
      <div className="flex justify-center">
        <span className="px-3 py-1 text-sm text-gray-400 bg-gray-800 border border-gray-700 rounded-full">
          {summary.handsPlayed} hands played
        </span>
      </div>

      {/* Net Result */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <NetResultDisplay value={summary.netResult} />
      </div>

      {/* GTO Score */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 flex justify-center">
        <GTOAlignmentCircle score={summary.gtoAlignmentScore} />
      </div>

      {/* Notable Hands */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm text-gray-400 uppercase tracking-wide font-medium">Notable Hands</h2>
        <NotableHandCard
          label="Biggest Win"
          handNumber={summary.biggestWin.handNumber}
          amount={summary.biggestWin.amount}
          handId={summary.biggestWin.handId}
          onClick={onHandClick}
        />
        <NotableHandCard
          label="Biggest Loss"
          handNumber={summary.biggestLoss.handNumber}
          amount={summary.biggestLoss.amount}
          handId={summary.biggestLoss.handId}
          onClick={onHandClick}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-2">
        <button
          onClick={onReviewHands}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-semibold rounded-xl transition-colors"
        >
          Review All Hands
        </button>
        <button
          onClick={onBackHome}
          className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-50 font-semibold rounded-xl border border-gray-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default SessionSummaryPanel;