interface StatCardProps {
  readonly label: string;
  readonly value: string | number;
  readonly subValue?: string;
  readonly color?: 'default' | 'green' | 'red' | 'yellow';
}

const colorStyles = {
  default: 'text-white',
  green: 'text-green-400',
  red: 'text-red-400',
  yellow: 'text-yellow-400',
};

export function StatCard({ label, value, subValue, color = 'default' }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colorStyles[color]}`}>
        {typeof value === 'number' ? formatValue(value) : value}
      </p>
      {subValue && <p className="mt-0.5 text-xs text-gray-500">{subValue}</p>}
    </div>
  );
}

function formatValue(val: number): string {
  if (Number.isInteger(val)) return val.toString();
  return val.toFixed(2);
}
