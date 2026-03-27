import { useState } from 'react';

export interface AnimationItem {
  id: string;
  type: 'deal' | 'chip' | 'flip';
  data: unknown;
}

export interface UseAnimationQueueReturn {
  queue: AnimationItem[];
  enqueue: (item: AnimationItem) => void;
  dequeue: () => void;
  isAnimating: boolean;
}

export function useAnimationQueue(): UseAnimationQueueReturn {
  const [queue] = useState<AnimationItem[]>([]);

  return {
    queue,
    enqueue: () => {},
    dequeue: () => {},
    isAnimating: false,
  };
}
