/**
 * GTODisclaimerBanner — displays a persistent disclaimer that GTO charts
 * are simplified references for learning, not solver-accurate outputs.
 */

import React from 'react';

interface GTODisclaimerBannerProps {
  message?: string;
  className?: string;
}

export const GTODisclaimerBanner: React.FC<GTODisclaimerBannerProps> = ({
  message = '简化 GTO 参考，仅供学习使用。实际 GTO 策略因对手范围和筹码深度而异。',
  className = '',
}) => (
  <div
    className={`flex items-start gap-2 rounded-lg border border-yellow-600/40 bg-yellow-900/20 px-4 py-3 text-sm text-yellow-300 ${className}`}
    role="alert"
  >
    <span className="mt-0.5 shrink-0 text-base" aria-hidden="true">⚠️</span>
    <p>{message}</p>
  </div>
);

export default GTODisclaimerBanner;
