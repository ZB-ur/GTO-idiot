import React from 'react';

interface CardData {
  rank: string;
  suit: string;
}

interface StrategyAction {
  actionType: string;
  frequency: string;
  sizing: string;
}

interface Strategy {
  position: 'IP' | 'OOP';
  sprRange: 'low' | 'medium' | 'high';
  title: string;
  titleZh: string;
  actions: StrategyAction[];
  keyPrinciple: string;
  keyPrincipleZh: string;
  isSimplified: boolean;
}

interface BoardTextureSectionProps {
  boardTexture: string;
  title: string;
  description: string;
  exampleBoard: CardData[];
  strategies: Strategy[];
}

const SUIT_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  hearts: { symbol: '♥', color: '#e74c3c' },
  diamonds: { symbol: '♦', color: '#e74c3c' },
  clubs: { symbol: '♣', color: '#ecf0f1' },
  spades: { symbol: '♠', color: '#ecf0f1' },
};

const PlayingCard: React.FC<{ card: CardData }> = ({ card }) => {
  const suit = SUIT_SYMBOLS[card.suit] || { symbol: '?', color: '#ecf0f1' };
  return (
    <div className="inline-flex flex-col items-center justify-center w-10 h-14 bg-white rounded-md shadow-sm border border-gray-300">
      <span className="text-sm font-bold" style={{ color: suit.color === '#e74c3c' ? '#e74c3c' : '#1a1a2e' }}>
        {card.rank}
      </span>
      <span className="text-base -mt-1" style={{ color: suit.color }}>
        {suit.symbol}
      </span>
    </div>
  );
};

const StrategyCard: React.FC<{ strategy: Strategy }> = ({ strategy }) => {
  const posColor = strategy.position === 'IP' ? 'text-emerald-400' : 'text-amber-400';
  const posBg = strategy.position === 'IP' ? 'bg-emerald-500/10' : 'bg-amber-500/10';

  return (
    <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={`${posBg} ${posColor} px-2 py-0.5 rounded text-xs font-medium`}>{strategy.position}</span>
        <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded text-xs font-medium">
          {strategy.sprRange.toUpperCase()} SPR
        </span>
        {strategy.isSimplified && (
          <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-xs">≈ Simplified</span>
        )}
      </div>
      <h4 className="text-gray-200 text-sm font-semibold mb-2">{strategy.title}</h4>

      <div className="space-y-1.5 mb-3">
        {strategy.actions.map((action, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-gray-300">{action.actionType}</span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-medium">{action.frequency}</span>
              <span className="text-gray-500 text-xs">{action.sizing}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-gray-700/50">
        <p className="text-gray-500 text-xs italic">{strategy.keyPrinciple}</p>
      </div>
    </div>
  );
};

export const BoardTextureSection: React.FC<BoardTextureSectionProps> = ({
  boardTexture,
  title,
  description,
  exampleBoard,
  strategies,
}) => {
  const textureColors: Record<string, string> = {
    dry: 'border-amber-500/30',
    wet: 'border-blue-500/30',
    monotone: 'border-purple-500/30',
  };
  const textureBadgeColors: Record<string, string> = {
    dry: 'bg-amber-500/10 text-amber-400',
    wet: 'bg-blue-500/10 text-blue-400',
    monotone: 'bg-purple-500/10 text-purple-400',
  };

  return (
    <div className={`rounded-xl border ${textureColors[boardTexture] || 'border-gray-700'} bg-[#16213e] p-6`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-gray-100 text-lg font-semibold">{title}</h3>
            <span className={`${textureBadgeColors[boardTexture] || ''} px-2 py-0.5 rounded-full text-xs font-medium`}>
              {boardTexture}
            </span>
          </div>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
        {/* Example Board */}
        <div className="flex gap-1 shrink-0 ml-4">
          {exampleBoard.map((card, i) => (
            <PlayingCard key={i} card={card} />
          ))}
        </div>
      </div>

      {/* Strategy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {strategies.map((strategy, i) => (
          <StrategyCard key={i} strategy={strategy} />
        ))}
      </div>
    </div>
  );
};

export default BoardTextureSection;