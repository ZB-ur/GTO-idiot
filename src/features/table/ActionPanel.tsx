import type { ReactNode } from 'react';
import { RaiseControl } from './RaiseControl';

export function ActionPanel(): ReactNode {
  return (
    <div>
      <button>Fold</button>
      <button>Check</button>
      <button>Call</button>
      <RaiseControl minRaise={0} maxRaise={0} onRaise={() => {}} />
    </div>
  );
}
