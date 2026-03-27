import { useState } from 'react';

export interface UseBotActionsReturn {
  isBotThinking: boolean;
  currentBotId: string | null;
}

export function useBotActions(): UseBotActionsReturn {
  const [isBotThinking] = useState(false);
  const [currentBotId] = useState<string | null>(null);

  return { isBotThinking, currentBotId };
}
