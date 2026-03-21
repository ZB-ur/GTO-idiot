// ============================================================
// GTO Idiot — Replay Viewer Component
// Full replay experience: table snapshot + controls + deviations
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReplayData, ReplayStep } from '../../types';
import { getReplayData } from '../../services/replay-service';
import { analyzeHandDeviations } from '../../services/deviation-analyzer';
import ErrorBoundary from '../common/ErrorBoundary';
import LoadingSpinner from '../common/LoadingSpinner';
import { CardRow } from '../game/CardDisplay';
import ReplayControls from './ReplayControls';
import DeviationDetail from './DeviationDetail';

interface ReplayViewerProps {
  handId: string;
  onClose: () => void;
}

export default function ReplayViewer({ handId, onClose }: ReplayViewerProps) {
  const [replayData, setReplayData] = useState<ReplayData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load replay data
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Load replay and deviations in parallel
        const [replay] = await Promise.all([
          getReplayData(handId),
          analyzeHandDeviations(handId).catch(() => null),
        ]);

        if (!cancelled) {
          setReplayData(replay);
          setCurrentStep(0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load replay data');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [handId]);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" message="Loading replay..." />
      </div>
    );
  }

  if (error || !replayData) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <button
          onClick={onClose}
          className="mb-4 text-sm text-gray-400 transition hover:text-white"
        >
          &larr; Back to History
        </button>
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-6 text-center">
          <p className="text-red-400">{error ?? 'No replay data available.'}</p>
        </div>
      </div>
    );
  }

  const step = replayData.steps[currentStep];

  return (
    <ErrorBoundary>
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-sm text-gray-400 transition hover:text-white"
          >
            &larr; Back to History
          </button>
          <span className="text-sm text-gray-500">
            Hand #{replayData.hand_id.slice(0, 8)}
          </span>
        </div>

        {/* Table snapshot */}
        <ReplayTableView step={step} />

        {/* Deviation detail (if any at this step) */}
        {step.deviation && (
          <div className="mt-4">
            <DeviationDetail deviation={step.deviation} />
          </div>
        )}

        {/* Action log for current step */}
        <StepActionLog step={step} />

        {/* Controls */}
        <div className="mt-4">
          <ReplayControls
            replayData={replayData}
            currentStep={currentStep}
            onStepChange={handleStepChange}
          />
        </div>

        {/* Deviation timeline */}
        <DeviationTimeline
          steps={replayData.steps}
          currentStep={currentStep}
          onJump={handleStepChange}
        />
      </div>
    </ErrorBoundary>
  );
}

// ---------- Table View ----------

function ReplayTableView({ step }: { step: ReplayStep }) {
  const { table_state } = step;

  return (
    <div className="rounded-lg border border-gray-700 bg-gradient-to-b from-green-900/20 to-gray-900 p-6">
      {/* Community cards */}
      <div className="mb-6 flex items-center justify-center gap-4">
        <span className="text-xs uppercase text-gray-500">Board</span>
        {table_state.community_cards.length > 0 ? (
          <CardRow cards={table_state.community_cards} size="md" />
        ) : (
          <span className="text-sm text-gray-600">No community cards</span>
        )}
      </div>

      {/* Pot */}
      <div className="mb-4 text-center">
        <span className="rounded-full bg-gray-800 px-4 py-1 text-sm font-semibold text-yellow-400">
          Pot: {table_state.pot.toFixed(1)}
        </span>
      </div>

      {/* Players */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {table_state.players.map((player) => (
          <div
            key={player.seat}
            className={`rounded-lg border p-3 ${
              !player.is_active
                ? 'border-gray-800 bg-gray-900/50 opacity-50'
                : step.action?.seat === player.seat
                  ? 'border-green-500/50 bg-green-900/10'
                  : 'border-gray-700 bg-gray-800/50'
            }`}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-300">
                {player.name}
              </span>
              <span className="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-400">
                {player.position}
              </span>
            </div>
            <div className="mb-1">
              {player.hole_cards ? (
                <CardRow cards={player.hole_cards} size="sm" />
              ) : (
                <CardRow cards={[null, null]} faceDown size="sm" />
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                {player.stack.toFixed(1)}
              </span>
              {player.last_action && (
                <span className="text-gray-400">{player.last_action}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Step Action Log ----------

function StepActionLog({ step }: { step: ReplayStep }) {
  const typeLabels: Record<ReplayStep['type'], string> = {
    deal_hole_cards: 'Dealing hole cards...',
    post_blinds: 'Posting blinds...',
    player_action: '',
    deal_community: `Dealing ${step.street}...`,
    showdown: 'Showdown!',
  };

  const message = step.type === 'player_action' && step.action
    ? `${step.action.player_name} (${step.action.position}): ${step.action.action}${
        step.action.amount != null ? ` ${step.action.amount}` : ''
      }`
    : typeLabels[step.type];

  if (!message) return null;

  return (
    <div className="mt-3 flex items-center gap-2">
      {step.is_hero_decision && (
        <span className="rounded bg-blue-600/20 px-2 py-0.5 text-[10px] font-medium text-blue-400">
          YOUR TURN
        </span>
      )}
      <span className="text-sm text-gray-400">{message}</span>
    </div>
  );
}

// ---------- Deviation Timeline ----------

function DeviationTimeline({
  steps,
  currentStep,
  onJump,
}: {
  steps: ReplayStep[];
  currentStep: number;
  onJump: (step: number) => void;
}) {
  const deviationSteps = useMemo(
    () => steps.filter((s) => s.deviation != null),
    [steps],
  );

  if (deviationSteps.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-300">
        Deviations ({deviationSteps.length})
      </h3>
      <div className="space-y-2">
        {deviationSteps.map((s) => {
          const isActive = s.index === currentStep;
          const severity = s.deviation!.severity;
          const severityColors = {
            minor: 'text-yellow-400',
            moderate: 'text-orange-400',
            severe: 'text-red-400',
          };

          return (
            <button
              key={s.index}
              onClick={() => onJump(s.index)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs transition ${
                isActive ? 'bg-gray-700' : 'hover:bg-gray-700/50'
              }`}
            >
              <span className={`font-medium ${severityColors[severity]}`}>
                Step {s.index + 1}
              </span>
              <span className="text-gray-500 capitalize">{s.street}</span>
              <span className="flex-1 truncate text-gray-400">
                {s.deviation!.description}
              </span>
              <span className="text-red-400">
                -{s.deviation!.ev_loss.toFixed(2)} BB
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
