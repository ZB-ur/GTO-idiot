import React from 'react';
import type { Card } from '../../types';
import PlayingCard from '../components/PlayingCard';

export interface CommunityCardsProps {
  cards: Card[];
}

const CommunityCards: React.FC<CommunityCardsProps> = ({ cards }) => {
  return (
    <div className="community-cards">
      {cards.map((card, i) => (
        <PlayingCard key={i} card={card} />
      ))}
    </div>
  );
};

export default CommunityCards;
