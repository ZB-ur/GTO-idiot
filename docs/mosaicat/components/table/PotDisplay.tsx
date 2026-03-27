import React from 'react';

interface PotDisplayProps {
  amount: number;
  sidePots?: { amount: number }[];
}

export const PotDisplay: React.FC<PotDisplayProps> = ({ amount, sidePots }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gray-900/80 border border-gray-700 backdrop-blur-sm">
        <span className="text-gray-400 text-sm font-medium">底池:</span>
        <span className="text-amber-400 text-sm font-bold">
          ${amount.toLocaleString()}
        </span>
      </div>
      {sidePots && sidePots.length > 0 && (
        <div className="flex items-center gap-2">
          {sidePots.map((pot, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-900/60 border border-gray-800 text-xs"
            >
              <span className="text-gray-500">边池:</span>
              <span className="text-amber-500 font-semibold">
                ${pot.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};