import type { HandReplay, DecisionDetail } from '../../../types';

export async function getHandReplay(_handId: string): Promise<HandReplay | null> {
  return null;
}

export async function getDecisionDetail(
  _handId: string,
  _decisionIndex: number,
): Promise<DecisionDetail | null> {
  return null;
}

export function generateExplanation(
  _decision: DecisionDetail,
): string {
  return '';
}
