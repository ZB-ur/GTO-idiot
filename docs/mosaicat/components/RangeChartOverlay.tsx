import React, { useEffect, useRef } from 'react';
import { RangeChart } from './RangeChart';

interface RangeChartOverlayProps {
  open: boolean;
  onClose: () => void;
  userPosition: string;
}

export const RangeChartOverlay: React.FC<RangeChartOverlayProps> = ({
  open,
  onClose,
  userPosition,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedPosition, setSelectedPosition] = React.useState(userPosition);
  const [selectedScenario, setSelectedScenario] = React.useState('open_raise');
  const [matrix, setMatrix] = React.useState<any[]>([]);
  const [rangePercentage, setRangePercentage] = React.useState(0);

  useEffect(() => {
    setSelectedPosition(userPosition);
  }, [userPosition]);

  useEffect(() => {
    if (open) {
      // Fetch range data from API
      fetch(`/api/gto/ranges/preflop?position=${selectedPosition}&scenario=${selectedScenario}`)
        .then((res) => res.json())
        .then((data) => {
          setMatrix(data.matrix);
          setRangePercentage(data.rangePercentage);
        })
        .catch(console.error);
    }
  }, [open, selectedPosition, selectedScenario]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full max-w-lg z-50 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: '#1a1a2e' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-gray-100 text-lg font-semibold">Preflop Ranges</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
          <RangeChart
            matrix={matrix}
            selectedPosition={selectedPosition}
            selectedScenario={selectedScenario}
            onPositionChange={setSelectedPosition}
            onScenarioChange={setSelectedScenario}
            rangePercentage={rangePercentage}
          />
        </div>
      </div>
    </>
  );
};

export default RangeChartOverlay;