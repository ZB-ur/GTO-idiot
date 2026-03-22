import React from 'react';

// Types from API spec
type BoardTexture =
  | 'high_rainbow_disconnected' | 'high_rainbow_connected' | 'high_monotone'
  | 'high_twotone_disconnected' | 'high_twotone_connected'
  | 'low_rainbow_disconnected' | 'low_rainbow_connected' | 'low_monotone'
  | 'low_twotone_disconnected' | 'low_twotone_connected'
  | 'mixed_rainbow' | 'mixed_twotone' | 'mixed_monotone';

type HandStrengthTier = 'nuts' | 'strong' | 'medium' | 'weak' | 'air';

type ActionType = 'fold' | 'check' | 'call' | 'bet_small' | 'bet_medium' | 'bet_big' | 'raise' | 'all_in';

interface PostflopRecommendation {
  primaryAction: ActionType;
  frequency?: number;
  sizing?: string;
  alternativeAction?: ActionType;
  alternativeFrequency?: number;
  explanation?: string;
}

interface PostflopGuideData {
  boardTexture: BoardTexture;
  handStrength: HandStrengthTier;
  street: 'flop' | 'turn' | 'river';
  isInPosition: boolean;
  recommendation: PostflopRecommendation;
  disclaimer: string;
}

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const variantClasses: Record<string, string> = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${variantClasses[variant]}`}>
      {label}
    </span>
  );
};

const ACTION_CONFIG: Record<ActionType, { label: string; color: string; badgeVariant: BadgeProps['variant'] }> = {
  fold: { label: 'Fold', color: 'text-gray-500', badgeVariant: 'default' },
  check: { label: 'Check', color: 'text-blue-600', badgeVariant: 'info' },
  call: { label: 'Call', color: 'text-green-600', badgeVariant: 'success' },
  bet_small: { label: 'Bet Small', color: 'text-yellow-600', badgeVariant: 'warning' },
  bet_medium: { label: 'Bet Medium', color: 'text-orange-600', badgeVariant: 'warning' },
  bet_big: { label: 'Bet Big', color: 'text-red-600', badgeVariant: 'danger' },
  raise: { label: 'Raise', color: 'text-red-600', badgeVariant: 'danger' },
  all_in: { label: 'All-in', color: 'text-red-800', badgeVariant: 'danger' },
};

const STRENGTH_CONFIG: Record<HandStrengthTier, { label: string; emoji: string; color: string }> = {
  nuts: { label: 'Nuts', emoji: '💎', color: 'text-purple-600' },
  strong: { label: 'Strong', emoji: '💪', color: 'text-green-600' },
  medium: { label: 'Medium', emoji: '🤔', color: 'text-yellow-600' },
  weak: { label: 'Weak', emoji: '😬', color: 'text-orange-600' },
  air: { label: 'Air', emoji: '💨', color: 'text-gray-400' },
};

function formatBoardTexture(bt: BoardTexture): string {
  return bt
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface PostflopGuideProps {
  guide: PostflopGuideData;
}

export const PostflopGuide: React.FC<PostflopGuideProps> = ({ guide }) => {
  const { recommendation } = guide;
  const primaryCfg = ACTION_CONFIG[recommendation.primaryAction];
  const strengthCfg = STRENGTH_CONFIG[guide.handStrength];
  const altCfg = recommendation.alternativeAction
    ? ACTION_CONFIG[recommendation.alternativeAction]
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
      {/* Header Tags */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge label={guide.street.charAt(0).toUpperCase() + guide.street.slice(1)} variant="info" />
        <Badge label={guide.isInPosition ? 'In Position' : 'Out of Position'} variant={guide.isInPosition ? 'success' : 'warning'} />
        <Badge label={formatBoardTexture(guide.boardTexture)} />
      </div>

      {/* Hand Strength */}
      <div className="flex items-center gap-2">
        <span className="text-xl">{strengthCfg.emoji}</span>
        <span className={`text-lg font-semibold ${strengthCfg.color}`}>{strengthCfg.label}</span>
      </div>

      {/* Primary Recommendation */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold ${primaryCfg.color}`}>{primaryCfg.label}</span>
            {recommendation.sizing && (
              <span className="text-sm text-gray-500">({recommendation.sizing})</span>
            )}
          </div>
          {recommendation.frequency != null && (
            <span className="text-sm font-medium text-gray-600">
              {(recommendation.frequency * 100).toFixed(0)}%
            </span>
          )}
        </div>

        {/* Frequency bar */}
        {recommendation.frequency != null && (
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${recommendation.frequency * 100}%` }}
            />
          </div>
        )}

        {/* Alternative Action */}
        {altCfg && recommendation.alternativeAction && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">or</span>
              <span className={`text-sm font-semibold ${altCfg.color}`}>{altCfg.label}</span>
            </div>
            {recommendation.alternativeFrequency != null && (
              <span className="text-xs text-gray-500">
                {(recommendation.alternativeFrequency * 100).toFixed(0)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Explanation */}
      {recommendation.explanation && (
        <p className="text-sm text-gray-600 leading-relaxed">{recommendation.explanation}</p>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">{guide.disclaimer}</p>
    </div>
  );
};

export default PostflopGuide;