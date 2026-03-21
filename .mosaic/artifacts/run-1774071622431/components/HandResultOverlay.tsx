import React from 'react';

interface Winner {
  playerName: string;
  amount: number;
  handStrength?: string;
}

interface HandResultOverlayProps {
  winners: Winner[];
  onDismiss: () => void;
}

export const HandResultOverlay: React.FC<HandResultOverlayProps> = ({ winners, onDismiss }) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onDismiss}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-center text-xl font-bold text-white">Hand Complete</h2>

        <div className="space-y-3">
          {winners.map((winner, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-emerald-900/30 border border-emerald-700/50 rounded-lg px-4 py-3"
            >
              <div>
                <div className="text-white font-semibold">{winner.playerName}</div>
                {winner.handStrength && (
                  <div className="text-emerald-400 text-sm">{winner.handStrength}</div>
                )}
              </div>
              <div className="text-emerald-300 font-bold font-mono text-lg">
                +{winner.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onDismiss}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Next Hand
        </button>
      </div>
    </div>
  );
};

export default HandResultOverlay;