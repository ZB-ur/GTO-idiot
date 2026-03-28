import React from 'react';

type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';
type GtoDeviation = 'match' | 'minor' | 'severe' | 'no_data';

interface DecisionPoint {
  index: number;
  playerId: string;
  position: string;
  street: Street;
  actionType: ActionType;
  amount?: number | null;
  isUserDecision: boolean;
  potAtDecision?: number;
  stackAtDecision?: number;
  gtoAnalysis?: {
    hasData: boolean;
    deviation: GtoDeviation;
  } | null;
  boardAtDecision?: Array<{ rank: string; suit: string }>;
}

interface ReviewTimelineProps {
  decisionPoints: DecisionPoint[];
  currentIndex: number;
  onSelectPoint: (index: number) => void;
}

const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];

const streetLabels: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
};

function getDeviationColor(point: DecisionPoint): string {
  if (!point.isUserDecision) return 'bg-gray-600';
  if (!point.gtoAnalysis?.hasData) return 'bg-gray-500';
  switch (point.gtoAnalysis.deviation) {
    case 'match': return 'bg-emerald-500';
    case 'minor': return 'bg-yellow-500';
    case 'severe': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

function getDeviationRing(point: DecisionPoint, isSelected: boolean): string {
  if (isSelected) return 'ring-2 ring-amber-400 ring-offset-2 ring-offset-gray-900';
  return '';
}

export const ReviewTimeline: React.FC<ReviewTimelineProps> = ({
  decisionPoints,
  currentIndex,
  onSelectPoint,
}) => {
  // Group decision points by street
  const grouped = streetOrder
    .map((street) => ({
      street,
      points: decisionPoints.filter((dp) => dp.street === street),
    }))
    .filter((g) => g.points.length > 0);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center gap-1 overflow-x-auto">
        {grouped.map((group, gi) => (
          <React.Fragment key={group.street}>
            {gi > 0 && (
              <div className="flex-shrink-0 w-8 h-px bg-gray-700" />
            )}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-500 font-medium">
                {streetLabels[group.street]}
              </span>
              <div className="flex items-center gap-1.5">
                {group.points.map((point) => {
                  const isSelected = point.index === currentIndex;
                  const dotSize = point.isUserDecision ? 'w-4 h-4' : 'w-2.5 h-2.5';
                  return (
                    <button
                      key={point.index}
                      className={`${dotSize} rounded-full ${getDeviationColor(point)} ${getDeviationRing(point, isSelected)} transition-all hover:scale-125 cursor-pointer`}
                      onClick={() => onSelectPoint(point.index)}
                      title={`${point.position}: ${point.actionType}${point.amount ? ` ${point.amount}` : ''}`}
                    />
                  );
                })}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ReviewTimeline;