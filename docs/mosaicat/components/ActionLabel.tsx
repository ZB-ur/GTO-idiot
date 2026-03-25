import React, { useEffect, useState } from 'react';

interface ActionLabelProps {
  actionType: string;
  amount?: number;
  visible: boolean;
}

const actionColors: Record<string, string> = {
  fold: 'text-gray-400',
  check: 'text-emerald-500',
  call: 'text-emerald-400',
  bet: 'text-amber-400',
  raise: 'text-amber-400',
  'all-in': 'text-red-500',
};

const ActionLabel: React.FC<ActionLabelProps> = ({ actionType, amount, visible }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2500);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [visible, actionType, amount]);

  if (!show) return null;

  const colorClass = actionColors[actionType.toLowerCase()] ?? 'text-gray-100';
  const label = actionType.toUpperCase();
  const formattedAmount = amount != null ? ` $${amount.toLocaleString()}` : '';

  return (
    <div
      className={`absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700 text-sm font-bold whitespace-nowrap transition-opacity duration-500 ${colorClass}`}
      style={{ animation: 'fadeInOut 2.5s ease-in-out forwards' }}
    >
      {label}{formattedAmount}
    </div>
  );
};

export default ActionLabel;