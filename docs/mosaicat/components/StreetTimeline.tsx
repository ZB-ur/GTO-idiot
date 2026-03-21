import React from 'react';

export type Street = 'preflop' | 'flop' | 'turn' | 'river';
export type DeviationSeverity = 'minor' | 'moderate' | 'severe';

export interface StreetDeviation {
  street: string;
  severity: string;
  stepIndex: number;
}

export interface StreetIndices {
  preflop: number;
  flop?: number;
  turn?: number;
  river?: number;
}

export interface StreetTimelineProps {
  currentStreet: string;
  streetIndices: StreetIndices;
  deviations?: StreetDeviation[];
  onJumpToStreet: (street: string) => void;
  onJumpToDeviation: (stepIndex: number) => void;
}

const ALL_STREETS: Street[] = ['preflop', 'flop', 'turn', 'river'];

const streetLabels: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const severityColorMap: Record<string, { dot: string; ring: string; pulse: string }> = {
  minor: {
    dot: 'bg-green-400',
    ring: 'ring-green-400/30',
    pulse: 'bg-green-400/40',
  },
  moderate: {
    dot: 'bg-yellow-400',
    ring: 'ring-yellow-400/30',
    pulse: 'bg-yellow-400/40',
  },
  severe: {
    dot: 'bg-red-400',
    ring: 'ring-red-400/30',
    pulse: 'bg-red-400/40',
  },
};

const DeviationMarker: React.FC<{
  deviation: StreetDeviation;
  onClick: (stepIndex: number) => void;
}> = ({ deviation, onClick }) => {
  const colors = severityColorMap[deviation.severity] ?? severityColorMap.minor;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(deviation.stepIndex);
      }}
      className="group relative flex items-center justify-center"
      aria-label={`${deviation.severity} deviation on ${deviation.street}, step ${deviation.stepIndex}`}
      title={`${deviation.severity} deviation — click to jump`}
    >
      {/* Pulse animation ring */}
      {deviation.severity === 'severe' && (
        <span
          className={`absolute w-4 h-4 rounded-full animate-ping ${colors.pulse}`}
        />
      )}
      {/* Dot */}
      <span
        className={`
          relative w-3 h-3 rounded-full
          ${colors.dot}
          ring-2 ${colors.ring}
          transition-transform duration-150
          group-hover:scale-125
          cursor-pointer
        `}
      />
    </button>
  );
};

export const StreetTimeline: React.FC<StreetTimelineProps> = ({
  currentStreet,
  streetIndices,
  deviations = [],
  onJumpToStreet,
  onJumpToDeviation,
}) => {
  const getDeviationsForStreet = (street: Street): StreetDeviation[] =>
    deviations.filter((d) => d.street === street);

  const isStreetAvailable = (street: Street): boolean =>
    streetIndices[street] !== undefined;

  const streetOrder = ALL_STREETS.indexOf(currentStreet as Street);

  return (
    <div className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {ALL_STREETS.map((street, index) => {
          const available = isStreetAvailable(street);
          const isCurrent = street === currentStreet;
          const isPast =
            available && ALL_STREETS.indexOf(street) < streetOrder;
          const streetDeviations = getDeviationsForStreet(street);
          const hasDeviation = streetDeviations.length > 0;

          return (
            <React.Fragment key={street}>
              {/* Connector line */}
              {index > 0 && (
                <div className="flex-1 mx-1">
                  <div
                    className={`h-0.5 w-full rounded-full transition-colors duration-300 ${
                      isPast || isCurrent
                        ? 'bg-emerald-500'
                        : available
                        ? 'bg-gray-600'
                        : 'bg-gray-800'
                    }`}
                  />
                </div>
              )}

              {/* Street node */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                {/* Street button */}
                <button
                  onClick={() => available && onJumpToStreet(street)}
                  disabled={!available}
                  className={`
                    relative flex flex-col items-center gap-1 px-4 py-2 rounded-lg
                    transition-all duration-200
                    ${
                      isCurrent
                        ? 'bg-emerald-500/15 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10'
                        : isPast
                        ? 'bg-gray-800 hover:bg-gray-700 cursor-pointer'
                        : available
                        ? 'bg-gray-800/50 hover:bg-gray-800 cursor-pointer'
                        : 'opacity-40 cursor-not-allowed'
                    }
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Jump to ${streetLabels[street]}`}
                >
                  {/* Circle indicator */}
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center
                      transition-all duration-200
                      ${
                        isCurrent
                          ? 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                          : isPast
                          ? 'bg-emerald-500/60'
                          : available
                          ? 'bg-gray-600'
                          : 'bg-gray-800 border border-gray-700'
                      }
                    `}
                  >
                    {isPast && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-xs font-semibold tracking-wide ${
                      isCurrent
                        ? 'text-emerald-400'
                        : isPast
                        ? 'text-gray-300'
                        : available
                        ? 'text-gray-500'
                        : 'text-gray-600'
                    }`}
                  >
                    {streetLabels[street]}
                  </span>
                </button>

                {/* Deviation markers row */}
                {hasDeviation && (
                  <div className="flex items-center gap-1">
                    {streetDeviations.map((dev) => (
                      <DeviationMarker
                        key={dev.stepIndex}
                        deviation={dev}
                        onClick={onJumpToDeviation}
                      />
                    ))}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StreetTimeline;