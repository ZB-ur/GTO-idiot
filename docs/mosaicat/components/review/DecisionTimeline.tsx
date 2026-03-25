import React from 'react';

export interface DecisionPointData {
  index: number;
  street: string;
  isHero: boolean;
}

export interface DecisionTimelineProps {
  decisionPoints: DecisionPointData[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

const STREET_ORDER = ['preflop', 'flop', 'turn', 'river', 'showdown'];

const STREET_LABELS: Record<string, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
};

export const DecisionTimeline: React.FC<DecisionTimelineProps> = ({
  decisionPoints,
  currentIndex,
  onSelect,
}) => {
  // Group decision points by street
  const grouped = STREET_ORDER
    .map((street) => ({
      street,
      label: STREET_LABELS[street] ?? street,
      points: decisionPoints.filter((dp) => dp.street === street),
    }))
    .filter((g) => g.points.length > 0);

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max px-2 py-3">
        {grouped.map((group, gi) => (
          <React.Fragment key={group.street}>
            {/* Street separator line */}
            {gi > 0 && (
              <div className="flex items-center px-1">
                <div className="w-6 h-px bg-gray-300" />
              </div>
            )}

            {/* Street group */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {group.label}
              </span>
              <div className="flex items-center gap-1.5">
                {group.points.map((point, pi) => {
                  const isActive = point.index === currentIndex;
                  return (
                    <React.Fragment key={point.index}>
                      {/* Connector between dots within same street */}
                      {pi > 0 && (
                        <div className="w-3 h-px bg-gray-300" />
                      )}
                      <button
                        type="button"
                        onClick={() => onSelect(point.index)}
                        className={[
                          'w-5 h-5 rounded-full border-2 transition-all duration-150 flex items-center justify-center',
                          'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1',
                          isActive
                            ? point.isHero
                              ? 'bg-blue-600 border-blue-600 ring-2 ring-blue-300 ring-offset-1 scale-125'
                              : 'bg-gray-500 border-gray-500 ring-2 ring-gray-300 ring-offset-1 scale-125'
                            : point.isHero
                              ? 'bg-blue-100 border-blue-400 hover:bg-blue-200 hover:border-blue-500 cursor-pointer'
                              : 'bg-gray-100 border-gray-300 hover:bg-gray-200 hover:border-gray-400 cursor-pointer',
                        ].join(' ')}
                        aria-label={`Decision ${point.index + 1} – ${group.label}${point.isHero ? ' (Hero)' : ''}`}
                        aria-current={isActive ? 'step' : undefined}
                      >
                        {isActive && (
                          <span className="block w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-2 pb-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-100 border border-blue-400" />
          <span className="text-[10px] text-gray-500">Hero</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-100 border border-gray-300" />
          <span className="text-[10px] text-gray-500">Opponent</span>
        </div>
      </div>
    </div>
  );
};

export default DecisionTimeline;