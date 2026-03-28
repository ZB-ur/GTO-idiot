import { useState, useEffect, useRef } from 'react';

/**
 * Hook to manage card dealing animation state.
 * Returns which card indices should be animated (staggered reveal).
 */
export function useCardDeal(cardCount: number, delayMs = 150): readonly boolean[] {
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const prevCount = useRef(0);

  useEffect(() => {
    if (cardCount <= prevCount.current) {
      // Cards removed or same — reset
      setRevealed(Array(cardCount).fill(true));
      prevCount.current = cardCount;
      return;
    }

    // New cards added — animate them in sequence
    const newRevealed = Array(cardCount).fill(false).map((_, i) => i < prevCount.current);
    setRevealed(newRevealed);

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = prevCount.current; i < cardCount; i++) {
      const timer = setTimeout(() => {
        setRevealed((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, (i - prevCount.current) * delayMs);
      timers.push(timer);
    }

    prevCount.current = cardCount;
    return () => timers.forEach(clearTimeout);
  }, [cardCount, delayMs]);

  return revealed;
}
