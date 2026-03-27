import type { ReactNode } from 'react';
import { NewGameButton } from './NewGameButton';
import { SessionList } from './SessionList';

export function LobbyPage(): ReactNode {
  return (
    <div>
      <NewGameButton />
      <SessionList />
    </div>
  );
}
