import React from 'react';

export interface ExplanationTextProps {
  text: string;
}

export const ExplanationText: React.FC<ExplanationTextProps> = ({ text }) => {
  return (
    <p className="text-sm text-gray-600 leading-relaxed pl-1">
      <span className="text-gray-400 mr-1">💡</span>
      {text}
    </p>
  );
};

export default ExplanationText;