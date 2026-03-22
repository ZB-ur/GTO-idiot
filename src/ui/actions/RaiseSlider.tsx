import React, { useState } from 'react';

export interface RaiseSliderProps {
  min: number;
  max: number;
  onRaise: (amount: number) => void;
}

const RaiseSlider: React.FC<RaiseSliderProps> = ({ min, max, onRaise }) => {
  const [value, setValue] = useState(min);

  return (
    <div className="raise-slider">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <span>{value}</span>
      <button onClick={() => onRaise(value)}>Raise</button>
    </div>
  );
};

export default RaiseSlider;
