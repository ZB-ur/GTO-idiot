/**
 * GTOReferenceView — top-level GTO reference page with tabs for
 * Preflop Chart and Postflop Guide.
 */

import React, { useState } from 'react';
import { PreflopChart } from './PreflopChart';
import { PostflopGuide } from './PostflopGuide';

type GTOTab = 'preflop' | 'postflop';

interface GTOReferenceViewProps {
  className?: string;
}

export const GTOReferenceView: React.FC<GTOReferenceViewProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<GTOTab>('preflop');

  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">GTO Reference</h1>
        <p className="mt-1 text-sm text-gray-400">
          Simplified GTO charts for Texas Hold'em. Use these as a study guide, not absolute strategy.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-700" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'preflop'}
          onClick={() => setActiveTab('preflop')}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'preflop'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Preflop Chart
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'postflop'}
          onClick={() => setActiveTab('postflop')}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'postflop'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Postflop Guide
        </button>
      </div>

      {/* Tab content */}
      <div role="tabpanel">
        {activeTab === 'preflop' ? <PreflopChart /> : <PostflopGuide />}
      </div>
    </div>
  );
};

export default GTOReferenceView;
