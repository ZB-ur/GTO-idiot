import React, { useState, useRef, useCallback } from 'react';
import { GlossaryTooltip } from './GlossaryTooltip';

interface GlossaryTermProps {
  termId: string;
  children: React.ReactNode;
}

// Term definitions would come from a glossary data source
const GLOSSARY_DATA: Record<string, { term: string; fullName: string; definition: string }> = {};

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({ termId, children }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLSpanElement>(null);

  const showTooltip = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({ x: rect.left + rect.width / 2, y: rect.bottom + 8 });
    }
    setVisible(true);
  }, []);

  const hideTooltip = useCallback(() => {
    setVisible(false);
  }, []);

  const termData = GLOSSARY_DATA[termId];

  return (
    <>
      <span
        ref={ref}
        className="border-b border-dashed border-gray-500 text-gray-100 cursor-help transition-colors hover:border-emerald-400 hover:text-emerald-400"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onClick={showTooltip}
        role="term"
        aria-describedby={`glossary-${termId}`}
      >
        {children}
      </span>
      {termData && (
        <GlossaryTooltip
          term={termData.term}
          fullName={termData.fullName}
          definition={termData.definition}
          visible={visible}
          position={position}
        />
      )}
    </>
  );
};