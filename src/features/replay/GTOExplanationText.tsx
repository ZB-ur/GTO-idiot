import type { ReactNode } from 'react';

export interface GTOExplanationTextProps {
  explanation: string;
}

export function GTOExplanationText({ explanation }: GTOExplanationTextProps): ReactNode {
  return <p>{explanation}</p>;
}
