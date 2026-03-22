import React from 'react';

export interface PotDisplayProps {
  amount: number;
  sidePots?: { amount: number }[];
}

const PotDisplay: React.FC<PotDisplayProps> = ({ amount, sidePots }) => {
  return (
    <div className="pot-display">
      <span className="main-pot">{amount}</span>
      {sidePots?.map((sp, i) => (
        <span key={i} className="side-pot">{sp.amount}</span>
      ))}
    </div>
  );
};

export default PotDisplay;
