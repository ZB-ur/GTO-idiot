import React from 'react';

interface TabItemProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[64px]
        transition-colors duration-150 ease-in-out
        border-b-2 text-sm font-medium
        ${
          isActive
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
        }
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="w-5 h-5">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

export default TabItem;