'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface ScenarioItem {
  scenario: string;
  label: string;
  sampleSize: number;
  userFrequency: number;
  gtoFrequency: number;
}

interface ScenarioStats {
  scenarios: ScenarioItem[];
}

interface ScenarioRadarChartProps {
  data: ScenarioStats;
  isLoading?: boolean;
  onScenarioClick?: (scenario: string) => void;
}

const CustomTooltip: React.FC<{ active?: boolean; payload?: any[] }> = ({
  active,
  payload,
}) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-md text-sm">
      <p className="font-semibold text-gray-900 mb-1">{item.label}</p>
      <p className="text-blue-600">
        You: {(item.userFrequency * 100).toFixed(1)}%
      </p>
      <p className="text-emerald-600">
        GTO: {(item.gtoFrequency * 100).toFixed(1)}%
      </p>
      <p className="text-gray-400 text-xs mt-1">
        {item.sampleSize} hands
      </p>
    </div>
  );
};

const SkeletonRadar: React.FC = () => (
  <div className="flex items-center justify-center h-80">
    <div className="relative w-56 h-56">
      {/* Concentric circles skeleton */}
      {[1, 0.75, 0.5, 0.25].map((scale) => (
        <div
          key={scale}
          className="absolute inset-0 m-auto rounded-full border border-gray-200 animate-pulse"
          style={{
            width: `${scale * 100}%`,
            height: `${scale * 100}%`,
          }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-80 text-gray-400">
    <svg
      className="w-12 h-12 mb-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"
      />
    </svg>
    <p className="text-sm font-medium">No scenario data yet</p>
    <p className="text-xs mt-1">Play more hands to see your radar chart</p>
  </div>
);

export const ScenarioRadarChart: React.FC<ScenarioRadarChartProps> = ({
  data,
  isLoading = false,
  onScenarioClick,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Scenario Radar
        </h3>
        <SkeletonRadar />
      </div>
    );
  }

  if (!data?.scenarios?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Scenario Radar
        </h3>
        <EmptyState />
      </div>
    );
  }

  const chartData = data.scenarios.map((s) => ({
    ...s,
    // Scale to percentage for display
    userPct: Math.round(s.userFrequency * 100),
    gtoPct: Math.round(s.gtoFrequency * 100),
  }));

  const handleClick = (entry: any) => {
    if (onScenarioClick && entry?.scenario) {
      onScenarioClick(entry.scenario);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Scenario Radar</h3>
        <span className="text-xs text-gray-400">
          Click a dimension to drill down
        </span>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              className="cursor-pointer"
              onClick={(_: any, index: number) => {
                const item = chartData[index];
                if (item) handleClick(item);
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Radar
              name="You"
              dataKey="userPct"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.15}
              strokeWidth={2}
              dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
              activeDot={{
                r: 6,
                fill: '#2563eb',
                stroke: '#fff',
                strokeWidth: 2,
                onClick: (_: any, payload: any) =>
                  handleClick(payload?.payload),
              }}
            />
            <Radar
              name="GTO"
              dataKey="gtoPct"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.08}
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="line"
              wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScenarioRadarChart;