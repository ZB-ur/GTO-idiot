import React, { useState, useCallback, useMemo, useEffect } from 'react';

// --- Types ---

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface Action {
  seatIndex: number;
  position: string;
  street: string;
  actionType: string;
  amount?: number;
  isAllIn?: boolean;
  potAfterAction?: number;
  timestamp: string;
}

interface ReplayStepPlayer {
  seatIndex: number;
  stack: number;
  isActive: boolean;
  holeCards?: Card[];
  currentBet?: number;
}

interface ReplayStep {
  stepIndex: number;
  totalSteps: number;
  type: 'initial' | 'action' | 'deal_community' | 'showdown';
  action?: Action;
  newCards?: Card[];
  gameState: {
    pot: number;
    communityCards: Card[];
    players: ReplayStepPlayer[];
    street: string;
  };
}

interface HandReplayResponse {
  handId: string;
  steps: ReplayStep[];
  playerSeatIndex: number;
  showdownCards: Array<{
    seatIndex: number;
    holeCards: Card[];
  }>;
}

interface GTOAnnotation {
  stepIndex: number;
  street: string;
  position: string;
  holeCards?: Card[];
  communityCards?: Card[];
  playerAction: {
    actionType: string;
    amount?: number;
  };
  gtoDistribution: {
    raise: number;
    call: number;
    fold: number;
  };
  severity: 'good' | 'minor' | 'mistake' | 'blunder';
  evLossBbPer100?: number;
  explanation?: string;
  hasReferenceData?: boolean;
}

interface HandGTOAnalysis {
  handId: string;
  annotations: GTOAnnotation[];
  deviationCounts: {
    blunders: number;
    mistakes: number;
    minors: number;
    goods: number;
  };
  disclaimer?: string;
}

interface ReplayScreenProps {
  replay: HandReplayResponse;
  gtoAnalysis?: HandGTOAnalysis;
  onBack: () => void;
}

// --- Helpers ---

const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<string, string> = {
  s: 'text-gray-50',
  h: 'text-red-400',
  d: 'text-sky-400',
  c: 'text-emerald-400',
};

const SEVERITY_COLORS: Record<string, string> = {
  good: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30',
  minor: 'bg-amber-400/20 text-amber-400 border-amber-400/30',
  mistake: 'bg-orange-400/20 text-orange-400 border-orange-400/30',
  blunder: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const SEVERITY_LABELS: Record<string, string> = {
  good: 'Good',
  minor: 'Minor',
  mistake: 'Mistake',
  blunder: 'Blunder',
};

const POSITION_LABELS = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

function formatCard(card: Card): { rank: string; suit: string; color: string } {
  return {
    rank: card.rank === 'T' ? '10' : card.rank,
    suit: SUIT_SYMBOLS[card.suit],
    color: SUIT_COLORS[card.suit],
  };
}

function formatAction(action: Action): string {
  const type = action.actionType.charAt(0).toUpperCase() + action.actionType.slice(1);
  if (action.amount && action.amount > 0 && action.actionType !== 'fold' && action.actionType !== 'check') {
    return `${type} ${action.amount}`;
  }
  return type;
}

function streetLabel(street: string): string {
  return street.charAt(0).toUpperCase() + street.slice(1);
}

// --- Sub-components ---

function CardDisplay({ card, size = 'md' }: { card: Card; size?: 'sm' | 'md' | 'lg' }) {
  const { rank, suit, color } = formatCard(card);
  const sizeClasses = {
    sm: 'w-7 h-10 text-xs',
    md: 'w-9 h-13 text-sm',
    lg: 'w-11 h-16 text-base',
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-white rounded-lg shadow-md flex flex-col items-center justify-center font-bold border border-gray-200`}
    >
      <span className="text-gray-900 leading-none">{rank}</span>
      <span className={`${color} leading-none`}>{suit}</span>
    </div>
  );
}

function PlayerSeat({
  player,
  position,
  isHuman,
  isHighlighted,
}: {
  player: ReplayStepPlayer;
  position: string;
  isHuman: boolean;
  isHighlighted: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
        isHighlighted ? 'ring-2 ring-amber-500/60' : ''
      } ${!player.isActive ? 'opacity-40' : ''}`}
    >
      <div className="flex gap-0.5">
        {player.holeCards?.map((card, i) => (
          <CardDisplay key={i} card={card} size="sm" />
        )) ?? (
          <>
            <div className="w-7 h-10 bg-emerald-800 rounded-lg border border-emerald-600" />
            <div className="w-7 h-10 bg-emerald-800 rounded-lg border border-emerald-600" />
          </>
        )}
      </div>
      <div
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          isHuman ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-300'
        }`}
      >
        {isHuman ? 'You' : `Seat ${player.seatIndex + 1}`}
      </div>
      <span className="text-[10px] text-gray-500 font-medium">{position}</span>
      <span className="text-xs text-gray-400 font-mono">{player.stack}</span>
      {player.currentBet != null && player.currentBet > 0 && (
        <span className="text-[10px] text-amber-400 font-mono">Bet: {player.currentBet}</span>
      )}
    </div>
  );
}

function CommunityCards({ cards }: { cards: Card[] }) {
  return (
    <div className="flex items-center justify-center gap-1.5 min-h-[4rem]">
      {cards.length === 0 ? (
        <span className="text-gray-600 text-sm italic">No community cards</span>
      ) : (
        cards.map((card, i) => <CardDisplay key={i} card={card} size="md" />)
      )}
    </div>
  );
}

function PotDisplay({ pot }: { pot: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <div className="bg-gray-800 border border-gray-700 rounded-full px-4 py-1.5 flex items-center gap-2">
        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" />
        </svg>
        <span className="text-amber-400 font-bold text-sm">{pot}</span>
      </div>
    </div>
  );
}

function ReplayControls({
  currentStep,
  totalSteps,
  onStepChange,
  isPlaying,
  onPlayToggle,
}: {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
}) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-center gap-4">
      <button
        onClick={() => onStepChange(0)}
        disabled={currentStep === 0}
        className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Go to start"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => onStepChange(Math.max(0, currentStep - 1))}
        disabled={currentStep === 0}
        className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous step"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={onPlayToggle}
        className="p-2.5 rounded-lg bg-amber-500 text-gray-950 hover:bg-amber-400 transition-colors"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <button
        onClick={() => onStepChange(Math.min(totalSteps - 1, currentStep + 1))}
        disabled={currentStep >= totalSteps - 1}
        className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next step"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button
        onClick={() => onStepChange(totalSteps - 1)}
        disabled={currentStep >= totalSteps - 1}
        className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Go to end"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
      <div className="flex-1 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={totalSteps - 1}
          value={currentStep}
          onChange={(e) => onStepChange(Number(e.target.value))}
          className="flex-1 accent-amber-500 h-1.5 bg-gray-700 rounded-full cursor-pointer"
        />
        <span className="text-gray-400 text-sm font-mono whitespace-nowrap">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>
    </div>
  );
}

function ActionLog({
  steps,
  currentStep,
  onStepClick,
  annotations,
}: {
  steps: ReplayStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
  annotations?: Map<number, GTOAnnotation>;
}) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-50">Action Log</h3>
      </div>
      <div className="flex-1 overflow-y-auto max-h-80 divide-y divide-gray-800/50">
        {steps.map((step) => {
          const annotation = annotations?.get(step.stepIndex);
          const isCurrent = step.stepIndex === currentStep;
          let label = '';
          if (step.type === 'initial') label = 'Deal';
          else if (step.type === 'deal_community') label = streetLabel(step.gameState.street);
          else if (step.type === 'showdown') label = 'Showdown';
          else if (step.action) label = `${step.action.position} ${formatAction(step.action)}`;

          return (
            <button
              key={step.stepIndex}
              onClick={() => onStepClick(step.stepIndex)}
              className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors hover:bg-gray-800/50 ${
                isCurrent ? 'bg-gray-800 border-l-2 border-amber-500' : 'border-l-2 border-transparent'
              }`}
            >
              <span className="text-[10px] text-gray-600 font-mono w-5 text-right">{step.stepIndex + 1}</span>
              <span
                className={`text-sm flex-1 ${
                  step.type === 'deal_community'
                    ? 'text-sky-400 font-medium'
                    : step.type === 'showdown'
                      ? 'text-amber-400 font-medium'
                      : 'text-gray-300'
                }`}
              >
                {label}
              </span>
              {step.action?.potAfterAction != null && (
                <span className="text-[10px] text-gray-500 font-mono">{step.action.potAfterAction}</span>
              )}
              {annotation && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${SEVERITY_COLORS[annotation.severity]}`}
                >
                  {SEVERITY_LABELS[annotation.severity]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GTOAnnotationPanel({ annotation }: { annotation: GTOAnnotation }) {
  const { gtoDistribution } = annotation;
  const maxFreq = Math.max(gtoDistribution.raise, gtoDistribution.call, gtoDistribution.fold);

  return (
    <div className={`bg-gray-900 border rounded-xl p-4 space-y-3 ${SEVERITY_COLORS[annotation.severity].split(' ')[2] || 'border-gray-700'}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-50">GTO Analysis</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SEVERITY_COLORS[annotation.severity]}`}>
          {SEVERITY_LABELS[annotation.severity]}
          {annotation.evLossBbPer100 != null && ` (−${annotation.evLossBbPer100} bb/100)`}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Your action:</span>
          <span className="text-gray-50 font-medium">
            {annotation.playerAction.actionType}
            {annotation.playerAction.amount ? ` ${annotation.playerAction.amount}` : ''}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="text-xs text-gray-500 font-medium">GTO Frequencies</div>
          {(['raise', 'call', 'fold'] as const).map((action) => {
            const freq = gtoDistribution[action];
            return (
              <div key={action} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-10 capitalize">{action}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      action === 'raise'
                        ? 'bg-red-400'
                        : action === 'call'
                          ? 'bg-emerald-400'
                          : 'bg-gray-500'
                    }`}
                    style={{ width: `${freq * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 font-mono w-10 text-right">
                  {(freq * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {annotation.explanation && (
        <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-800 pt-3">
          {annotation.explanation}
        </p>
      )}
    </div>
  );
}

function DeviationSummary({ counts }: { counts: HandGTOAnalysis['deviationCounts'] }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-xs text-gray-400">{counts.goods}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <span className="text-xs text-gray-400">{counts.minors}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-orange-400" />
        <span className="text-xs text-gray-400">{counts.mistakes}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-xs text-gray-400">{counts.blunders}</span>
      </div>
    </div>
  );
}

// --- Main Component ---

export default function ReplayScreen({ replay, gtoAnalysis, onBack }: ReplayScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGTO, setShowGTO] = useState(true);

  const step = replay.steps[currentStep];
  const totalSteps = replay.steps.length;

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCurrentStep((s) => s + 1), 1200);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalSteps]);

  // Build annotation map
  const annotationMap = useMemo(() => {
    if (!gtoAnalysis) return new Map<number, GTOAnnotation>();
    return new Map(gtoAnalysis.annotations.map((a) => [a.stepIndex, a]));
  }, [gtoAnalysis]);

  const currentAnnotation = annotationMap.get(currentStep);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
    setIsPlaying(false);
  }, []);

  const handlePlayToggle = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleStepChange(Math.min(totalSteps - 1, currentStep + 1));
      else if (e.key === 'ArrowLeft') handleStepChange(Math.max(0, currentStep - 1));
      else if (e.key === ' ') {
        e.preventDefault();
        handlePlayToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, totalSteps, handleStepChange, handlePlayToggle]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-50">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-50 transition-colors"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold">Hand Replay</h1>
            <p className="text-xs text-gray-500 font-mono">{replay.handId}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {gtoAnalysis && <DeviationSummary counts={gtoAnalysis.deviationCounts} />}
          {gtoAnalysis && (
            <button
              onClick={() => setShowGTO((v) => !v)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                showGTO
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-gray-800 text-gray-400 border-gray-700'
              }`}
            >
              GTO {showGTO ? 'ON' : 'OFF'}
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto">
        {/* Left: Table + Controls */}
        <div className="flex-1 space-y-4">
          {/* Street indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {['preflop', 'flop', 'turn', 'river'].map((s) => (
                <span
                  key={s}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                    step.gameState.street === s
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-gray-600'
                  }`}
                >
                  {streetLabel(s)}
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>

          {/* Table area */}
          <div className="bg-emerald-900/30 border-2 border-emerald-700/40 rounded-2xl p-6 space-y-4 relative">
            {/* Top row seats */}
            <div className="flex justify-around">
              {step.gameState.players.slice(0, 3).map((player) => (
                <PlayerSeat
                  key={player.seatIndex}
                  player={player}
                  position={POSITION_LABELS[player.seatIndex] ?? `S${player.seatIndex}`}
                  isHuman={player.seatIndex === replay.playerSeatIndex}
                  isHighlighted={step.action?.seatIndex === player.seatIndex}
                />
              ))}
            </div>

            {/* Community cards + pot */}
            <div className="space-y-2">
              <CommunityCards cards={step.gameState.communityCards} />
              <PotDisplay pot={step.gameState.pot} />
            </div>

            {/* Bottom row seats */}
            <div className="flex justify-around">
              {step.gameState.players.slice(3, 6).map((player) => (
                <PlayerSeat
                  key={player.seatIndex}
                  player={player}
                  position={POSITION_LABELS[player.seatIndex] ?? `S${player.seatIndex}`}
                  isHuman={player.seatIndex === replay.playerSeatIndex}
                  isHighlighted={step.action?.seatIndex === player.seatIndex}
                />
              ))}
            </div>

            {/* Current action overlay */}
            {step.action && (
              <div className="absolute top-3 right-3 bg-gray-900/90 border border-gray-700 rounded-lg px-3 py-1.5">
                <span className="text-xs text-gray-400">{step.action.position}</span>
                <span className="text-sm text-gray-50 font-semibold ml-2">{formatAction(step.action)}</span>
              </div>
            )}
            {step.type === 'deal_community' && step.newCards && (
              <div className="absolute top-3 right-3 bg-sky-500/20 border border-sky-400/30 rounded-lg px-3 py-1.5">
                <span className="text-sm text-sky-400 font-medium">{streetLabel(step.gameState.street)} dealt</span>
              </div>
            )}
            {step.type === 'showdown' && (
              <div className="absolute top-3 right-3 bg-amber-500/20 border border-amber-500/30 rounded-lg px-3 py-1.5">
                <span className="text-sm text-amber-400 font-medium">Showdown</span>
              </div>
            )}
          </div>

          {/* Replay controls */}
          <ReplayControls
            currentStep={currentStep}
            totalSteps={totalSteps}
            onStepChange={handleStepChange}
            isPlaying={isPlaying}
            onPlayToggle={handlePlayToggle}
          />

          {/* GTO Annotation (below table on mobile, sidebar on desktop) */}
          {showGTO && currentAnnotation && (
            <div className="lg:hidden">
              <GTOAnnotationPanel annotation={currentAnnotation} />
            </div>
          )}
        </div>

        {/* Right sidebar: Action Log + GTO */}
        <div className="w-full lg:w-80 space-y-4">
          <ActionLog
            steps={replay.steps}
            currentStep={currentStep}
            onStepClick={handleStepChange}
            annotations={annotationMap}
          />

          {showGTO && currentAnnotation && (
            <div className="hidden lg:block">
              <GTOAnnotationPanel annotation={currentAnnotation} />
            </div>
          )}

          {gtoAnalysis?.disclaimer && (
            <p className="text-[10px] text-gray-600 italic px-1">{gtoAnalysis.disclaimer}</p>
          )}
        </div>
      </div>
    </div>
  );
}