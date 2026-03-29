import React from 'react';

interface QuickStartPanelProps {
  hasActiveSession: boolean;
  onNewSession: () => void;
  onContinue: () => void;
  onHistory: () => void;
  onStats: () => void;
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'default';
  disabled?: boolean;
  badge?: string;
}

const PlayIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const ContinueIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const HistoryIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const StatsIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10" />
    <path d="M12 20V4" />
    <path d="M6 20v-6" />
  </svg>
);

export const QuickStartPanel: React.FC<QuickStartPanelProps> = ({
  hasActiveSession,
  onNewSession,
  onContinue,
  onHistory,
  onStats,
}) => {
  const actions: QuickAction[] = [
    {
      id: 'new-session',
      label: '新牌局',
      description: '开始一局新的 6-max 德州扑克',
      icon: <PlayIcon />,
      onClick: onNewSession,
      variant: 'primary',
    },
    {
      id: 'continue',
      label: '继续牌局',
      description: '回到上次未完成的牌局',
      icon: <ContinueIcon />,
      onClick: onContinue,
      variant: 'secondary',
      disabled: !hasActiveSession,
      badge: hasActiveSession ? '进行中' : undefined,
    },
    {
      id: 'history',
      label: '历史记录',
      description: '浏览过往手牌与复盘回放',
      icon: <HistoryIcon />,
      onClick: onHistory,
      variant: 'default',
    },
    {
      id: 'stats',
      label: '数据统计',
      description: '查看长期表现与 GTO 偏差分析',
      icon: <StatsIcon />,
      onClick: onStats,
      variant: 'default',
    },
  ];

  const getCardClasses = (action: QuickAction): string => {
    const base =
      'relative flex flex-col items-start gap-3 p-6 rounded-xl border transition-all duration-200 cursor-pointer select-none';

    if (action.disabled) {
      return `${base} border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed`;
    }

    switch (action.variant) {
      case 'primary':
        return `${base} border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 hover:shadow-md active:scale-[0.98]`;
      case 'secondary':
        return `${base} border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md active:scale-[0.98]`;
      default:
        return `${base} border-gray-200 bg-white hover:bg-slate-50 hover:border-gray-300 hover:shadow-md active:scale-[0.98]`;
    }
  };

  const getIconClasses = (action: QuickAction): string => {
    const base = 'flex items-center justify-center w-12 h-12 rounded-lg';
    if (action.disabled) return `${base} bg-gray-200 text-gray-400`;
    switch (action.variant) {
      case 'primary':
        return `${base} bg-blue-600 text-white`;
      case 'secondary':
        return `${base} bg-emerald-600 text-white`;
      default:
        return `${base} bg-gray-100 text-gray-600`;
    }
  };

  return (
    <section className="w-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.disabled ? undefined : action.onClick}
            disabled={action.disabled}
            className={getCardClasses(action)}
            aria-label={action.label}
          >
            {action.badge && (
              <span className="absolute top-4 right-4 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                {action.badge}
              </span>
            )}
            <div className={getIconClasses(action)}>
              {action.icon}
            </div>
            <div className="text-left">
              <div className="text-base font-semibold text-gray-900">
                {action.label}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">
                {action.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default QuickStartPanel;