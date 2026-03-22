import React from 'react';

interface StreetInfo {
  name: string;
  available: boolean;
}

interface StreetNavigatorProps {
  streets: StreetInfo[];
  activeStreet: string;
  onStreetChange: (street: string) => void;
}

export const StreetNavigator: React.FC<StreetNavigatorProps> = ({
  streets,
  activeStreet,
  onStreetChange,
}) => {
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
      {streets.map((street, i) => {
        const isActive = street.name === activeStreet;
        return (
          <React.Fragment key={street.name}>
            {i > 0 && (
              <div
                className={`w-6 h-0.5 ${
                  street.available ? 'bg-blue-300' : 'bg-gray-200'
                }`}
              />
            )}
            <button
              onClick={() => street.available && onStreetChange(street.name)}
              disabled={!street.available}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : street.available
                  ? 'text-gray-700 hover:bg-white hover:shadow-sm'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              {street.name}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};