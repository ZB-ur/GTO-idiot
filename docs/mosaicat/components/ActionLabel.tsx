import React, { useEffect, useState } from 'react';

interface ActionLabelProps {
  action: string;
  amount?: number;
  visible: boolean;
  className?: string;
}

export const ActionLabel: React.FC<ActionLabelProps> = ({ action, amount, visible, className = '' }) => {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 1500);
      return () => clearTimeout(timer);
    }
    setShow(false);
  }, [visible, action, amount]);

  if (!show) return null;

  const colorMap: Record<string, string> = {
    fold: 'text-gray-400',
    check: 'text-gray-300',
    call: 'text-emerald-400',
    bet: 'text-amber-400',
    raise: 'text-amber-400',
    'all-in': 'text-red-400',
  };

  const textColor = colorMap[action.toLowerCase()] ?? 'text-gray-50';
  const displayText = amount != null ? `${action} ${amount}` : action;

  return (
    <div
      className={`px-2.5 py-1 rounded-lg bg-gray-950/80 backdrop-blur-sm text-sm font-semibold ${textColor} animate-fade-in select-none ${className}`}
    >
      {displayText}
    </div>
  );
};