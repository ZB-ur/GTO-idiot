import React from 'react';

const LEGEND_ITEMS = [
  { label: 'Raise / Bet', color: 'bg-amber-400' },
  { label: 'Call', color: 'bg-sky-400' },
  { label: 'Check', color: 'bg-gray-400' },
  { label: 'Fold', color: 'bg-gray-500' },
  { label: 'All In', color: 'bg-red-400' },
];

const GRADIENT_STOPS = [
  { label: '0%', opacity: 'opacity-10' },
  { label: '25%', opacity: 'opacity-25' },
  { label: '50%', opacity: 'opacity-50' },
  { label: '75%', opacity: 'opacity-75' },
  { label: '100%', opacity: 'opacity-100' },
];

export function RangeMatrixLegend() {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
      {/* Action Colors */}
      <div>
        <h4 className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2.5">
          Action Colors
        </h4>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${item.color}`} />
              <span className="text-xs text-gray-300 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Frequency Opacity */}
      <div>
        <h4 className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2.5">
          Frequency (opacity)
        </h4>
        <div className="flex items-center gap-1">
          {GRADIENT_STOPS.map((stop) => (
            <div key={stop.label} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-5 rounded-sm bg-amber-400 ${stop.opacity}`} />
              <span className="text-[10px] text-gray-500 tabular-nums">{stop.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notation Guide */}
      <div>
        <h4 className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2.5">
          Notation
        </h4>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-300 bg-gray-800 px-1.5 py-0.5 rounded">AKs</span>
            <span className="text-[10px] text-gray-500">= Suited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-300 bg-gray-800 px-1.5 py-0.5 rounded">AKo</span>
            <span className="text-[10px] text-gray-500">= Offsuit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-300 bg-gray-800 px-1.5 py-0.5 rounded">AA</span>
            <span className="text-[10px] text-gray-500">= Pair</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-px">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            </div>
            <span className="text-[10px] text-gray-500">= Mixed actions</span>
          </div>
        </div>
      </div>
    </div>
  );
}