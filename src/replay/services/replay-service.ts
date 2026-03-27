import type { HandHistory, HandReplay, DecisionSummary, GTORatingSummary, StreetAction, Street } from '../../types';

function extractUserDecisions(hand: HandHistory): DecisionSummary[] {
  const decisions: DecisionSummary[] = [];
  const streets: Street[] = ['preflop', 'flop', 'turn', 'river'];
  let decisionIndex = 0;

  for (const street of streets) {
    const actions: StreetAction[] | null | undefined = hand.streets[street];
    if (!actions) continue;

    for (const action of actions) {
      if (action.isUserAction) {
        decisions.push({
          decisionIndex: decisionIndex++,
          street,
          sequenceIndex: action.sequenceIndex,
          userAction: { actionType: action.actionType, amount: action.amount ?? null },
          gtoAction: { actionType: action.actionType, amount: action.amount ?? null },
          rating: 'optimal',
          evDifferenceBB: 0,
          isApproximate: true,
        });
      }
    }
  }

  return decisions;
}

function computeOverallRating(decisions: DecisionSummary[]): GTORatingSummary {
  let optimalCount = 0;
  let acceptableCount = 0;
  let errorCount = 0;

  for (const d of decisions) {
    if (d.rating === 'optimal') optimalCount++;
    else if (d.rating === 'acceptable') acceptableCount++;
    else errorCount++;
  }

  return {
    optimalCount,
    acceptableCount,
    errorCount,
    totalDecisions: decisions.length,
  };
}

export async function computeReplayDecisions(hand: HandHistory): Promise<HandReplay> {
  const decisions = extractUserDecisions(hand);
  const overallRating = computeOverallRating(decisions);

  return {
    handId: hand.handId,
    handNumber: hand.handNumber,
    playedAt: hand.playedAt,
    holeCards: hand.players.find((p) => p.isUser)?.holeCards ?? [{ rank: '2', suit: 's' }, { rank: '7', suit: 'h' }],
    resultBB: 0,
    communityCards: hand.communityCards,
    streets: hand.streets,
    decisions,
    overallRating,
  };
}
