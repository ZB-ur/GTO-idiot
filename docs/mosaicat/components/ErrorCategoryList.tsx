'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorCategory {
  errorType: string;
  title: string;
  count: number;
  percentage: number;
  severity: string; // 'red' | 'yellow' | 'green' | 'gray'
}

interface ErrorCategoryListProps {
  categories: ErrorCategory[];
  totalErrors: number;
  onViewHands?: (errorType: string) => void;
}

const SEVERITY_CONFIG: Record<string, { dot: string; bar: string; bg: string; border: string; label: string }> = {
  red: {
    dot: 'bg-red-400',
    bar: 'bg-red-500',
    bg: 'bg-red-900/15',
    border: 'border-red-800/30',
    label: 'Major',
  },
  yellow: {
    dot: 'bg-amber-400',
    bar: 'bg-amber-500',
    bg: 'bg-amber-900/15',
    border: 'border-amber-800/30',
    label: 'Minor',
  },
  green: {
    dot: 'bg-emerald-400',
    bar: 'bg-emerald-500',
    bg: 'bg-emerald-900/15',
    border: 'border-emerald-800/30',
    label: 'Low',
  },
  gray: {
    dot: 'bg-gray-400',
    bar: 'bg-gray-500',
    bg: 'bg-gray-800/30',
    border: 'border-gray-700/30',
    label: 'Info',
  },
};

export default function ErrorCategoryList({
  categories,
  totalErrors,
  onViewHands,
}: ErrorCategoryListProps) {
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => b.count - a.count),
    [categories],
  );

  if (sortedCategories.length === 0) {
    return (
      <div className="rounded-xl border border-gray-700/60 bg-gray-800/50 p-6 text-center">
        <p className="text-emerald-300 text-sm font-medium">
          No GTO errors detected — great play!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">
          Error Categories
        </h3>
        <span className="text-xs text-gray-500 tabular-nums">
          {totalErrors} total errors
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {sortedCategories.map((cat) => {
          const config = SEVERITY_CONFIG[cat.severity] ?? SEVERITY_CONFIG.gray;
          const isExpanded = expandedType === cat.errorType;

          return (
            <div key={cat.errorType}>
              {/* Card */}
              <button
                type="button"
                onClick={() =>
                  setExpandedType(isExpanded ? null : cat.errorType)
                }
                className={`
                  w-full text-left rounded-xl border p-4 transition-all
                  ${config.bg} ${config.border}
                  hover:brightness-110 cursor-pointer
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Severity dot */}
                  <span
                    className={`flex-shrink-0 w-3 h-3 rounded-full ${config.dot}`}
                  />

                  {/* Title + count */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-200 font-medium truncate">
                        {cat.title}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold tabular-nums ml-2 flex-shrink-0">
                        {cat.count}x ({cat.percentage.toFixed(1)}%)
                      </span>
                    </div>

                    {/* Percentage bar */}
                    <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${config.bar} transition-all duration-500`}
                        style={{ width: `${Math.min(100, cat.percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Expand chevron */}
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 py-3 ml-6 mt-1 rounded-lg bg-gray-800/40 border border-gray-700/40">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${config.dot} text-black mr-2`}>
                            {config.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            {cat.count} occurrences
                          </span>
                        </div>
                        {onViewHands && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewHands(cat.errorType);
                            }}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                          >
                            View Hands →
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}