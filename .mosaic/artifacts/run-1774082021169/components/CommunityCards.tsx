'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '@/engine/types';
import PlayingCard from './PlayingCard';

interface CommunityCardsProps {
  cards: Card[];
  revealAnimation?: boolean;
}

export default function CommunityCards({
  cards,
  revealAnimation = true,
}: CommunityCardsProps) {
  const slots = Array.from({ length: 5 }, (_, i) => cards[i] ?? null);

  return (
    <div className="flex items-center justify-center gap-2">
      <AnimatePresence mode="popLayout">
        {slots.map((card, index) => {
          if (!card) {
            return (
              <div
                key={`empty-${index}`}
                className="w-14 h-20 rounded-lg border border-gray-600/20"
              />
            );
          }

          const dealDelay =
            index < 3 ? index * 0.1 : 0;

          return (
            <motion.div
              key={`${card.rank}${card.suit}`}
              initial={
                revealAnimation
                  ? { y: -80, opacity: 0, scale: 0.5 }
                  : false
              }
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                delay: dealDelay,
              }}
            >
              <PlayingCard card={card} size="md" animated={revealAnimation} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}