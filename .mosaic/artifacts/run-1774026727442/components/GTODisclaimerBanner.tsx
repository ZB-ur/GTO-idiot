import React from 'react';

export const GTODisclaimerBanner: React.FC = () => {
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-emerald-800/20 border border-emerald-800/40 rounded-lg">
      <span className="text-emerald-400 text-sm mt-0.5 flex-shrink-0">ℹ️</span>
      <p className="text-xs text-gray-300 leading-relaxed">
        <span className="font-medium text-emerald-400">GTO 参考声明：</span>
        本应用提供的 GTO 建议基于简化规则引擎，为近似参考值，
        <span className="text-gray-400">非 solver 精确解</span>。
        实际 GTO 策略可能因具体场景而异，建议结合实践经验综合判断。
      </p>
    </div>
  );
};

export default GTODisclaimerBanner;