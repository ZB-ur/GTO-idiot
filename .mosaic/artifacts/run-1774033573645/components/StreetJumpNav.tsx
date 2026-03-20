import React from 'react';

export type Street = 'preflop' | 'flop' | 'turn' | 'river';

interface StreetJumpNavProps {
  streets: Street[];
  currentStreet: Street;
  onJump: (street: Street) => void;
}

const streetLabels: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const streetIcons: Record<Street, string> = {
  preflop: '🃏',
  flop: '3️⃣',
  turn: '4️⃣',
  river: '5️⃣',
};

export const StreetJumpNav: React.FC<StreetJumpNavProps> = ({
  streets,
  currentStreet,
  onJump,
}) => {
  const allStreets: Street[] = ['preflop', 'flop', 'turn', 'river'];

  return (
    <nav className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
      {allStreets.map((street, index) => {
        const isAvailable = streets.includes(street);
        const isCurrent = street === currentStreet;
        const isPast = isAvailable && allStreets.indexOf(street) < allStreets.indexOf(currentStreet);

        return (
          <React.Fragment key={street}>
            {index > 0 && (
              <div
                className={`h-px w-4 flex-shrink-0 ${
                  isPast || isCurrent ? 'bg-blue-300' : 'bg-gray-300'
                }`}
              />
            )}
            <button
              onClick={() => isAvailable && onJump(street)}
              disabled={!isAvailable}
              className={`
                relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium
                transition-all duration-150 ease-in-out
                ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isPast
                    ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm cursor-pointer'
                    : isAvailable
                    ? 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed'
                }
              `}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Jump to ${streetLabels[street]}`}
            >
              <span className="text-xs">{streetIcons[street]}</span>
              <span>{streetLabels[street]}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default StreetJumpNav;