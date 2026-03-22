import React, { useState, useRef, useEffect } from 'react';

export interface SessionSummary {
  id: string;
  date: string;
  handsPlayed: number;
  netProfitLossBB: number;
}

interface SessionFilterProps {
  sessions: SessionSummary[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export const SessionFilter: React.FC<SessionFilterProps> = ({
  sessions,
  selectedIds,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSession = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    onChange(sessions.map((s) => s.id));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const buttonLabel =
    selectedIds.length === 0
      ? '全部 Session'
      : selectedIds.length === sessions.length
        ? '全部 Session'
        : `${selectedIds.length} 个 Session`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span>{buttonLabel}</span>
        <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-md z-50 overflow-hidden">
          {/* Header actions */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
            <span className="text-xs font-medium text-gray-500">选择 Session</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                全选
              </button>
              <button
                onClick={handleClearAll}
                className="text-xs text-gray-400 hover:text-gray-600 font-medium"
              >
                清空
              </button>
            </div>
          </div>

          {/* Session list */}
          <div className="max-h-60 overflow-y-auto">
            {sessions.map((session) => {
              const isSelected = selectedIds.includes(session.id);
              const profitColor =
                session.netProfitLossBB >= 0 ? 'text-green-600' : 'text-red-500';

              return (
                <label
                  key={session.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSession(session.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {formatDate(session.date)}
                      </span>
                      <span className={`text-sm font-medium ${profitColor}`}>
                        {session.netProfitLossBB >= 0 ? '+' : ''}
                        {session.netProfitLossBB.toFixed(1)}BB
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {session.handsPlayed} 手
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionFilter;