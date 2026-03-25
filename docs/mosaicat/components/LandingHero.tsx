import React from 'react';

interface LandingHeroProps {
  onStartGame: () => void;
}

interface ValueProp {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const VALUE_PROPS: ValueProp[] = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: 'GTO Training',
    description: 'Real-time feedback on every decision compared to game-theory optimal play',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: '5 Unique Bots',
    description: 'Practice against TAG, LAG, Nit, Fish, and GTO bot personalities',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Track Progress',
    description: 'Detailed statistics, hand history replay, and GTO conformance trends',
  },
];

export const LandingHero: React.FC<LandingHeroProps> = ({ onStartGame }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#1a1a2e' }}>
      {/* Logo & Slogan */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-3xl">♠</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-100 tracking-tight">
            Poker<span className="text-emerald-400">Trainer</span>
          </h1>
        </div>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Master GTO poker strategy with real-time AI coaching at a 6-max table
        </p>
      </div>

      {/* Value Proposition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mb-10">
        {VALUE_PROPS.map((prop, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-700 p-5 text-center hover:border-emerald-500/30 transition-colors"
            style={{ background: '#1e293b' }}
          >
            <div className="text-emerald-400 flex justify-center mb-3">{prop.icon}</div>
            <h3 className="text-gray-100 font-semibold mb-1">{prop.title}</h3>
            <p className="text-gray-500 text-sm">{prop.description}</p>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={onStartGame}
        className="px-10 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-lg rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-400/30 hover:scale-[1.02] active:scale-[0.98]"
      >
        Start Playing
      </button>

      {/* Subtitle */}
      <p className="text-gray-600 text-sm mt-4">No sign-up required · Play instantly in your browser</p>
    </div>
  );
};

export default LandingHero;