import React from 'react';

interface TutorialStepProps {
  step: number;
  totalSteps: number;
  title: string;
  content: string;
  illustration?: React.ReactNode;
  onNext: () => void;
  isLast?: boolean;
}

const TutorialStep: React.FC<TutorialStepProps> = ({
  step,
  totalSteps,
  title,
  content,
  illustration,
  onNext,
  isLast = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] w-full max-w-md mx-auto px-6 py-8">
      {/* Progress Dots */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step - 1
                ? 'w-8 bg-blue-600'
                : i < step - 1
                ? 'w-2 bg-blue-300'
                : 'w-2 bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Illustration */}
      {illustration && (
        <div className="flex items-center justify-center w-48 h-48 mb-8 rounded-2xl bg-slate-50">
          {illustration}
        </div>
      )}

      {/* Text Content */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
        <p className="text-base text-gray-500 leading-relaxed max-w-sm">
          {content}
        </p>
      </div>

      {/* Step Counter */}
      <p className="text-sm text-gray-400 mb-4">
        {step} of {totalSteps}
      </p>

      {/* Action Button */}
      <button
        onClick={onNext}
        className="w-full max-w-xs px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
      >
        {isLast ? 'Get Started' : 'Next'}
      </button>
    </div>
  );
};

export default TutorialStep;