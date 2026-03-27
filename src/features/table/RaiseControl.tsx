import type { ReactNode } from 'react';

export interface RaiseControlProps {
  minRaise: number;
  maxRaise: number;
  onRaise: (amount: number) => void;
}

export function RaiseControl({ minRaise, maxRaise, onRaise }: RaiseControlProps): ReactNode {
  void onRaise;
  return (
    <div>
      <input type="range" min={minRaise} max={maxRaise} />
      <button>Raise</button>
    </div>
  );
}
