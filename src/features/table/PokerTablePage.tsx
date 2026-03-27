import type { ReactNode } from 'react';
import { TableFelt } from './TableFelt';
import { ActionPanel } from './ActionPanel';
import { SoundToggle } from './SoundToggle';
import { WinnerBanner } from './WinnerBanner';
import { BotThinkingIndicator } from './BotThinkingIndicator';

export function PokerTablePage(): ReactNode {
  return (
    <div>
      <TableFelt />
      <ActionPanel />
      <SoundToggle />
      <WinnerBanner />
      <BotThinkingIndicator />
    </div>
  );
}
