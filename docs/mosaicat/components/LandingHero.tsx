import React from 'react';

interface LandingHeroProps {
  onStart: () => void;
}

export function LandingHero({ onStart }: LandingHeroProps) {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      {/* Hero Illustration - Stylized cards */}
      <div className="relative mb-8">
        <div className="flex items-end gap-[-8px]">
          {/* Card 1 */}
          <div className="w-20 h-28 bg-gray-800 border border-gray-700 rounded-xl shadow-lg -rotate-12 flex items-center justify-center">
            <span className="text-3xl font-bold text-red-500">A♥</span>
          </div>
          {/* Card 2 */}
          <div className="w-20 h-28 bg-gray-800 border border-gray-700 rounded-xl shadow-lg rotate-6 -ml-4 flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-50">A♠</span>
          </div>
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-amber-400 rounded-full scale-150" />
      </div>

      {/* Product Name */}
      <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-50 mb-3 tracking-tight">
        Poker<span className="text-amber-400">Lab</span>
      </h1>

      {/* Tagline */}
      <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-md">
        Practice 6-max No-Limit Hold'em against adaptive bots. Learn GTO. Improve your game.
      </p>

      {/* CTA Button */}
      <button
        onClick={onStart}
        className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-lg rounded-xl transition-colors shadow-lg shadow-amber-500/20 active:scale-95"
      >
        Start Playing
      </button>

      {/* Sub-text */}
      <p className="mt-4 text-sm text-gray-500">
        No signup required · 100BB deep · Free forever
      </p>
    </section>
  );
}