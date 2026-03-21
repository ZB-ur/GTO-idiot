import { useState, useEffect, useRef } from 'react';

interface ChipMoveState {
  readonly isAnimating: boolean;
  readonly fromAmount: number;
  readonly toAmount: number;
}

/**
 * Hook to track chip amount transitions for animation.
 * Detects when a chip amount changes and exposes animation state.
 */
export function useChipMove(currentAmount: number, animationDurationMs = 400): ChipMoveState {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevAmount = useRef(currentAmount);

  useEffect(() => {
    if (currentAmount !== prevAmount.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        prevAmount.current = currentAmount;
      }, animationDurationMs);
      return () => clearTimeout(timer);
    }
  }, [currentAmount, animationDurationMs]);

  return {
    isAnimating,
    fromAmount: prevAmount.current,
    toAmount: currentAmount,
  };
}
