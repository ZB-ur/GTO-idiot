import React from 'react';

interface ValuePropCardProps {
  icon: string;
  title: string;
  description: string;
}

const ValuePropCard: React.FC<ValuePropCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6 hover:border-emerald-500/50 transition-colors duration-300 group">
      <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-2xl mb-4 group-hover:bg-emerald-500/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-gray-100 text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default ValuePropCard;