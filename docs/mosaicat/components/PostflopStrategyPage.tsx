import React, { useEffect, useState } from 'react';

// --- Types from API spec ---
interface Card {
  rank: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

interface StrategyCardData {
  position: 'IP' | 'OOP';
  sprRange: 'low' | 'medium' | 'high';
  title: string;
  titleZh: string;
  actions: Array<{
    actionType: string;
    frequency: string;
    sizing: string;
  }>;
  keyPrinciple: string;
  keyPrincipleZh: string;
  isSimplified: boolean;
}

interface BoardTextureSectionData {
  boardTexture: 'dry' | 'wet' | 'monotone';
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  exampleBoard: Card[];
  strategies: StrategyCardData[];
}

// --- Sub-component imports (assumed) ---
// import { BoardTextureSection } from './BoardTextureSection';
// import { SimplifiedGtoBadge } from './SimplifiedGtoBadge';
// import { SkeletonCard } from './SkeletonCard';

interface PostflopStrategyPageProps {
  sections: BoardTextureSectionData[];
  filterTexture?: string;
  onFilterChange: (texture?: string) => void;
  loading: boolean;
}

const TEXTURE_FILTERS = [
  { value: undefined, label: 'All', labelZh: '全部', icon: '🃏' },
  { value: 'dry', label: 'Dry', labelZh: '干燥', icon: '🏜️' },
  { value: 'wet', label: 'Wet', labelZh: '湿润', icon: '🌊' },
  { value: 'monotone', label: 'Monotone', labelZh: '同花', icon: '🎨' },
] as const;

const SUIT_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  spades: { symbol: '♠', color: '#ecf0f1' },
  hearts: { symbol: '♥', color: '#e74c3c' },
  diamonds: { symbol: '♦', color: '#e74c3c' },
  clubs: { symbol: '♣', color: '#ecf0f1' },
};

const TEXTURE_COLORS: Record<string, string> = {
  dry: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  wet: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  monotone: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const ACTION_COLORS: Record<string, string> = {
  Bet: 'bg-emerald-500/20 text-emerald-400',
  Raise: 'bg-red-500/20 text-red-400',
  Call: 'bg-blue-500/20 text-blue-400',
  Check: 'bg-gray-500/20 text-gray-400',
  Fold: 'bg-gray-600/20 text-gray-500',
};

function CardDisplay({ card }: { card: Card }) {
  const suit = SUIT_SYMBOLS[card.suit];
  return (
    <span
      className="inline-flex items-center justify-center w-10 h-14 rounded-md text-sm font-bold"
      style={{ backgroundColor: '#1a1a2e', border: '1px solid #334155', color: suit.color }}
    >
      {card.rank}
      <span className="ml-0.5">{suit.symbol}</span>
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
      <div className="h-5 w-40 rounded bg-gray-700 mb-4" />
      <div className="h-4 w-full rounded bg-gray-700 mb-3" />
      <div className="h-4 w-3/4 rounded bg-gray-700 mb-6" />
      <div className="space-y-3">
        <div className="h-12 rounded-lg bg-gray-700" />
        <div className="h-12 rounded-lg bg-gray-700" />
      </div>
    </div>
  );
}

function SimplifiedGtoBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/25">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      Simplified GTO
    </span>
  );
}

function StrategyCardComponent({ strategy }: { strategy: StrategyCardData }) {
  const posColor = strategy.position === 'IP' ? 'text-emerald-400' : 'text-red-400';
  const sprLabel = { low: 'Low SPR (<3)', medium: 'Med SPR (3-8)', high: 'High SPR (>8)' }[strategy.sprRange];

  return (
    <div
      className="rounded-xl p-5 border border-gray-700/50 hover:border-emerald-500/30 transition-colors"
      style={{ backgroundColor: '#1e293b' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${posColor}`}>{strategy.position}</span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-400">{sprLabel}</span>
        </div>
        {strategy.isSimplified && <SimplifiedGtoBadge />}
      </div>

      <h4 className="text-sm font-semibold text-gray-100 mb-1">{strategy.title}</h4>
      <p className="text-xs text-gray-500 mb-4">{strategy.titleZh}</p>

      <div className="space-y-2 mb-4">
        {strategy.actions.map((action, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-3 py-2 rounded-lg ${ACTION_COLORS[action.actionType] || 'bg-gray-700/30 text-gray-300'}`}
          >
            <span className="text-sm font-medium">{action.actionType}</span>
            <div className="flex items-center gap-3 text-xs">
              <span className="opacity-80">{action.frequency}</span>
              <span className="font-mono">{action.sizing}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg p-3 border border-gray-700/40" style={{ backgroundColor: '#16213e' }}>
        <p className="text-xs text-gray-300 leading-relaxed">{strategy.keyPrinciple}</p>
        <p className="text-xs text-gray-500 mt-1">{strategy.keyPrincipleZh}</p>
      </div>
    </div>
  );
}

function BoardTextureSectionComponent({ section }: { section: BoardTextureSectionData }) {
  const textureClass = TEXTURE_COLORS[section.boardTexture] || '';

  return (
    <section className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-gray-100">{section.title}</h2>
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${textureClass}`}>
              {section.boardTexture}
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-1">{section.description}</p>
          <p className="text-xs text-gray-500">{section.descriptionZh}</p>
        </div>
        <div className="flex gap-1.5 mt-1">
          {section.exampleBoard.map((card, i) => (
            <CardDisplay key={i} card={card} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {section.strategies.map((strategy, i) => (
          <StrategyCardComponent key={i} strategy={strategy} />
        ))}
      </div>
    </section>
  );
}

export default function PostflopStrategyPage({
  sections,
  filterTexture,
  onFilterChange,
  loading,
}: PostflopStrategyPageProps) {
  const filteredSections = filterTexture
    ? sections.filter((s) => s.boardTexture === filterTexture)
    : sections;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1a2e' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Postflop Strategy Reference</h1>
          <p className="text-sm text-gray-400">
            Simplified GTO strategies organized by board texture, position, and stack-to-pot ratio.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            翻牌后简化GTO策略参考，按牌面质地、位置和筹码池比分类。
          </p>
        </div>

        {/* Texture Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {TEXTURE_FILTERS.map((filter) => {
            const isActive = filterTexture === filter.value;
            return (
              <button
                key={filter.label}
                onClick={() => onFilterChange(filter.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                  ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'text-gray-400 border border-gray-700/50 hover:text-gray-200 hover:border-gray-600'
                  }
                `}
                style={{ backgroundColor: isActive ? undefined : '#1e293b' }}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
                <span className="text-xs opacity-60">{filter.labelZh}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-6 w-48 rounded bg-gray-700 mb-2" />
                  <div className="h-4 w-80 rounded bg-gray-700" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🃏</div>
            <p className="text-gray-400 text-sm">No strategies found for this filter.</p>
            <p className="text-gray-500 text-xs mt-1">未找到匹配的策略。</p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredSections.map((section) => (
              <BoardTextureSectionComponent key={section.boardTexture} section={section} />
            ))}
          </div>
        )}

        {/* Disclaimer */}
        {!loading && filteredSections.length > 0 && (
          <div
            className="mt-10 rounded-xl p-4 border border-amber-400/20 flex items-start gap-3"
            style={{ backgroundColor: 'rgba(251, 191, 36, 0.05)' }}
          >
            <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-xs text-amber-400 font-medium">
                These are simplified GTO approximations for learning purposes. Real GTO solutions are far more nuanced.
              </p>
              <p className="text-xs text-amber-400/60 mt-1">
                以上为简化GTO近似参考，仅供学习。真实GTO解法远比这复杂。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}