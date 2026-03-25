import React from 'react';

interface LearningHubProps {
  onNavigate: (section: 'range-chart' | 'postflop-strategy') => void;
}

interface LearningCard {
  id: 'range-chart' | 'postflop-strategy';
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  features: string[];
  badge?: string;
}

const learningCards: LearningCard[] = [
  {
    id: 'range-chart',
    title: 'Preflop Range Chart',
    titleZh: '翻前范围表',
    description: 'Interactive 13×13 matrix showing GTO opening ranges, 3-bet ranges, and more for every position.',
    descriptionZh: '交互式13×13矩阵，展示每个位置的GTO开池范围、3-bet范围等。',
    icon: '🃏',
    features: [
      '6 positions (UTG → BB)',
      '5 scenarios per position',
      'Color-coded frequencies',
      'Mixed strategy details',
    ],
    badge: 'Core',
  },
  {
    id: 'postflop-strategy',
    title: 'Postflop Strategy Reference',
    titleZh: '翻后策略参考',
    description: 'Simplified GTO guidelines organized by board texture, position, and stack-to-pot ratio.',
    descriptionZh: '按牌面结构、位置和筹码底池比整理的简化GTO指南。',
    icon: '📊',
    features: [
      'Dry / Wet / Monotone boards',
      'IP vs OOP strategies',
      'SPR-based sizing guides',
      'Key principles per spot',
    ],
    badge: 'Reference',
  },
];

export const LearningHub: React.FC<LearningHubProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen p-6" style={{ background: '#1a1a2e' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Learning Hub
          </h1>
          <p className="text-gray-400 text-lg">
            Master GTO strategy with interactive charts and reference guides.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningCards.map((card) => (
            <button
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className="group text-left rounded-xl border border-gray-700 p-6 transition-all duration-200 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#1a1a2e]"
              style={{ background: '#1e293b' }}
            >
              {/* Badge + Icon Row */}
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{card.icon}</span>
                {card.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    {card.badge}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl font-semibold text-gray-100 mb-1 group-hover:text-emerald-400 transition-colors">
                {card.title}
              </h2>
              <p className="text-sm text-gray-500 mb-3">{card.titleZh}</p>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                {card.description}
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-6">
                {card.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium group-hover:gap-3 transition-all">
                <span>Explore</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Footer Tip */}
        <div
          className="mt-8 rounded-lg border border-gray-700 p-4 flex items-start gap-3"
          style={{ background: '#16213e' }}
        >
          <span className="text-amber-400 text-lg flex-shrink-0">💡</span>
          <div>
            <p className="text-sm text-gray-300">
              <span className="font-medium text-gray-100">Tip:</span>{' '}
              Start with the Preflop Range Chart to build a solid foundation, then use the
              Postflop Strategy Reference to refine your play on later streets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningHub;