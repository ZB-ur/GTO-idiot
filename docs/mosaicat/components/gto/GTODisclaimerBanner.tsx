import React from 'react';

interface GTODisclaimerBannerProps {
  className?: string;
}

export const GTODisclaimerBanner: React.FC<GTODisclaimerBannerProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 ${className}`}
      role="alert"
    >
      <span className="text-base flex-shrink-0">⚠</span>
      <span>
        简化 GTO 参考，非精确纳什均衡解。仅供学习参考，实际决策请结合对手特征和牌桌动态。
      </span>
    </div>
  );
};

export default GTODisclaimerBanner;