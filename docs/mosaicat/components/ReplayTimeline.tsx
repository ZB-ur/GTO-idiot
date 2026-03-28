import React from 'react';

type Street = 'preflop' | 'flop' | 'turn' | 'river';

interface ReplayTimelineProps {
  streets: Street[];
  activeStreet: Street;
  decisionStreets: Street[];
  onStreetClick: (street: Street) => void;
}

const streetLabels: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

export const ReplayTimeline: React.FC<ReplayTimelineProps> = ({
  streets,
  activeStreet,
  decisionStreets,
  onStreetClick,
}) => {
  const activeIndex = streets.indexOf(activeStreet);

  return (
    <div className="w-full">
      <div className="flex items-center">
        {streets.map((street, index) => {
          const isActive = street === activeStreet;
          const isPast = index < activeIndex;
          const hasDecision = decisionStreets.includes(street);
          const isLast = index === streets.length - 1;

          return (
            <React.Fragment key={street}>
              {/* Step node */}
              <button
                type="button"
                onClick={() => onStreetClick(street)}
                className="flex flex-col items-center gap-1.5 group relative"
              >
                {/* Circle */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    transition-colors duration-150 border-2
                    ${isActive
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isPast
                        ? 'bg-blue-100 border-blue-300 text-blue-600'
                        : 'bg-white border-gray-200 text-gray-400 group-hover:border-gray-300'
                    }
                  `}
                >
                  {hasDecision ? (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                    </svg>
                  ) : isPast ? (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-xs font-medium whitespace-nowrap
                    ${isActive ? 'text-blue-600' : isPast ? 'text-gray-600' : 'text-gray-400'}
                  `}
                >
                  {streetLabels[street]}
                </span>

                {/* Decision dot indicator */}
                {hasDecision && !isActive && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white" />
                )}
              </button>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-1">
                  <div
                    className={`
                      h-0.5 w-full rounded-full transition-colors duration-150
                      ${index < activeIndex ? 'bg-blue-300' : 'bg-gray-200'}
                    `}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ReplayTimeline;