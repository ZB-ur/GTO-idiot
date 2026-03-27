import { useState } from 'react';

export interface UseSoundReturn {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (sound: string) => void;
}

export function useSound(): UseSoundReturn {
  const [isMuted, setIsMuted] = useState(false);

  return {
    isMuted,
    toggleMute: () => setIsMuted((m) => !m),
    playSound: () => {},
  };
}
