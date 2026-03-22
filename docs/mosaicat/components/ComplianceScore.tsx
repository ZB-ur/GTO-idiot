import React from 'react';

interface ComplianceScoreProps {
  score: number;
  label?: string;
  size?: 'sm' | 'lg';
}

export const ComplianceScore: React.FC<ComplianceScoreProps> = ({
  score,
  label = 'GTO Compliance',
  size = 'lg',
}) => {
  const isLg = size === 'lg';
  const dim = isLg ? 160 : 96;
  const stroke = isLg ? 10 : 6;
  const r = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 75 ? 'text-emerald-500 stroke-emerald-500' :
    score >= 50 ? 'text-amber-400 stroke-amber-400' :
    'text-red-500 stroke-red-500';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={stroke}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            className={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold ${color.split(' ')[0]} ${
              isLg ? 'text-4xl' : 'text-xl'
            }`}
          >
            {score}%
          </span>
        </div>
      </div>
      <span className={`font-medium text-gray-500 ${isLg ? 'text-sm' : 'text-xs'}`}>
        {label}
      </span>
    </div>
  );
};