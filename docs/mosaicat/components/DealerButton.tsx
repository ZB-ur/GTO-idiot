import React from 'react';

interface DealerButtonProps {
  position?: { x: number; y: number };
}

export const DealerButton: React.FC<DealerButtonProps> = ({ position }) => {
  const style: React.CSSProperties = position
    ? { position: 'absolute', left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }
    : {};

  return (
    <div
      className="w-8 h-8 rounded-full bg-white shadow-md border-2 border-gray-300
        flex items-center justify-center select-none"
      style={style}
    >
      <span className="text-gray-900 font-black text-sm leading-none">D</span>
    </div>
  );
};

export default DealerButton;