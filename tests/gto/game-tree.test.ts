import { describe, it, expect } from 'vitest';
import { buildGameTree, countNodes, DEFAULT_TREE_CONFIG, cfrActionToActionType, actionToBetSize } from '../../src/gto/game-tree';

describe('Game Tree', () => {
  it('should build game tree with check/bet nodes', () => {
    const root = buildGameTree();
    expect(root.type).toBe('player');
    expect(root.actions).toContain('check');
    // Should have at least one raise option
    const hasRaise = root.actions.some((a) => a.startsWith('raise'));
    expect(hasRaise).toBe(true);
  });

  it('should limit tree depth to avoid explosion', () => {
    const config = { ...DEFAULT_TREE_CONFIG, maxDepth: 3 };
    const root = buildGameTree(config);
    const nodeCount = countNodes(root);
    // With depth 3, tree should be manageable
    expect(nodeCount).toBeGreaterThan(1);
    expect(nodeCount).toBeLessThan(10000);
  });

  it('should create terminal nodes for fold and showdown', () => {
    const root = buildGameTree({ ...DEFAULT_TREE_CONFIG, maxDepth: 4 });
    // Check that fold action leads to a terminal node
    if (root.children.has('check')) {
      const checkChild = root.children.get('check')!;
      // Opponent should have actions including fold if facing a bet
      if (checkChild.type === 'player' && checkChild.actions.includes('fold')) {
        const foldNode = checkChild.children.get('fold')!;
        expect(foldNode.type).toBe('terminal');
        expect(foldNode.payoff).not.toBeNull();
      }
    }
    // A raise followed by fold should be terminal
    const raiseAction = root.actions.find((a) => a.startsWith('raise'));
    if (raiseAction) {
      const raiseChild = root.children.get(raiseAction)!;
      if (raiseChild.actions.includes('fold')) {
        const foldNode = raiseChild.children.get('fold')!;
        expect(foldNode.type).toBe('terminal');
      }
    }
  });

  it('should map CFR actions to action types correctly', () => {
    expect(cfrActionToActionType('fold')).toBe('fold');
    expect(cfrActionToActionType('check')).toBe('check');
    expect(cfrActionToActionType('call')).toBe('call');
    expect(cfrActionToActionType('raise_33')).toBe('raise');
    expect(cfrActionToActionType('raise_66')).toBe('raise');
    expect(cfrActionToActionType('raise_100')).toBe('raise');
  });

  it('should map actions to bet sizes', () => {
    expect(actionToBetSize('raise_33')).toBe(0.33);
    expect(actionToBetSize('raise_66')).toBe(0.66);
    expect(actionToBetSize('raise_100')).toBe(1.0);
    expect(actionToBetSize('check')).toBeNull();
    expect(actionToBetSize('fold')).toBeNull();
  });
});
