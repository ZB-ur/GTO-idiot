import type { Position } from '../../types/game';
import type { HandHistoryQuery } from '../../services/history-service';

interface HistoryFilterProps {
  readonly query: HandHistoryQuery;
  readonly onChange: (query: HandHistoryQuery) => void;
}

const POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

export function HistoryFilter({ query, onChange }: HistoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Position filter */}
      <select
        value={query.position ?? ''}
        onChange={e => onChange({ ...query, position: (e.target.value || undefined) as Position | undefined, offset: 0 })}
        className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 focus:border-felt-500 focus:outline-none"
      >
        <option value="">All Positions</option>
        {POSITIONS.map(pos => (
          <option key={pos} value={pos}>{pos}</option>
        ))}
      </select>

      {/* Result filter */}
      <select
        value={query.result ?? 'all'}
        onChange={e => onChange({ ...query, result: e.target.value as 'win' | 'loss' | 'all', offset: 0 })}
        className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 focus:border-felt-500 focus:outline-none"
      >
        <option value="all">All Results</option>
        <option value="win">Wins Only</option>
        <option value="loss">Losses Only</option>
      </select>

      {/* Sort */}
      <select
        value={`${query.sortBy ?? 'date'}-${query.sortOrder ?? 'desc'}`}
        onChange={e => {
          const [sortBy, sortOrder] = e.target.value.split('-') as ['date' | 'profit', 'asc' | 'desc'];
          onChange({ ...query, sortBy, sortOrder, offset: 0 });
        }}
        className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 focus:border-felt-500 focus:outline-none"
      >
        <option value="date-desc">Newest First</option>
        <option value="date-asc">Oldest First</option>
        <option value="profit-desc">Biggest Win</option>
        <option value="profit-asc">Biggest Loss</option>
      </select>
    </div>
  );
}
