import React, { ReactNode, useState, useRef, useEffect } from 'react';

interface TooltipPopoverProps {
  content: ReactNode;
  children: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const placementClasses: Record<string, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses: Record<string, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-700 border-x-transparent border-b-transparent border-4',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-700 border-x-transparent border-t-transparent border-4',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-700 border-y-transparent border-r-transparent border-4',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-700 border-y-transparent border-l-transparent border-4',
};

export const TooltipPopover: React.FC<TooltipPopoverProps> = ({
  content,
  children,
  placement = 'top',
}) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const show = () => {
    clearTimeout(timeoutRef.current);
    setVisible(true);
  };

  const hide = () => {
    timeoutRef.current = setTimeout(() => setVisible(false), 150);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={`absolute z-50 ${placementClasses[placement]}`}
        >
          <div className="bg-gray-700 border border-gray-600 text-gray-200 text-xs rounded-lg px-3 py-2 shadow-lg max-w-xs whitespace-normal">
            {content}
          </div>
          <div className={`absolute ${arrowClasses[placement]}`} />
        </div>
      )}
    </div>
  );
};

export default TooltipPopover;