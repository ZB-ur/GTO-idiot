import React from 'react';

export interface ComplianceScoreProps {
  score: number;
}

const ComplianceScore: React.FC<ComplianceScoreProps> = ({ score }) => {
  return (
    <div className="compliance-score">
      <span>{Math.round(score * 100)}%</span>
    </div>
  );
};

export default ComplianceScore;
