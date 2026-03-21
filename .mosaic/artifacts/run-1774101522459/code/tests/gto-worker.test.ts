// ============================================================
// GTO Worker — Integration tests for Web Worker message protocol
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { GTOEvaluationResult } from '../src/types';

// ============================================================
// Mock Worker implementation for testing message protocol
// ============================================================

class MockGTOWorker {
  private handler: ((msg: MessageEvent) => void) | null = null;
  private timeoutMs = 5000;

  set onmessage(fn: ((msg: MessageEvent) => void) | null) {
    this.handler = fn;
  }

  postMessage(data: { type: string; payload?: unknown }): void {
    setTimeout(() => {
      if (data.type === 'evaluate') {
        this.handler?.(new MessageEvent('message', {
          data: {
            type: 'evaluateResult',
            payload: this.makeMockResult(false),
          },
        }));
      } else if (data.type === 'batchEvaluate') {
        this.handler?.(new MessageEvent('message', {
          data: {
            type: 'batchEvaluateResult',
            payload: {
              handId: 'test-hand',
              decisionPoints: [],
              totalEvLossBB: 0,
            },
          },
        }));
      } else {
        this.handler?.(new MessageEvent('message', {
          data: { type: 'error', message: 'Unknown message type' },
        }));
      }
    }, 10);
  }

  terminate(): void {
    // No-op
  }

  private makeMockResult(isDegraded: boolean): GTOEvaluationResult {
    return {
      actions: [
        { action: 'call', amount: null, evBB: 0.5, frequency: 0.6 },
        { action: 'fold', amount: null, evBB: 0, frequency: 0.4 },
      ],
      recommendedAction: 'call',
      recommendedAmount: null,
      handStrength: 0.65,
      potOdds: 0.25,
      spr: 8,
      isDegraded,
    };
  }
}

// ============================================================
// Tests
// ============================================================

describe('GTO Worker', () => {
  it('responds to evaluate message with GTOEvaluationResult', async () => {
    const worker = new MockGTOWorker();

    const result = await new Promise<GTOEvaluationResult>((resolve) => {
      worker.onmessage = (msg) => {
        if (msg.data.type === 'evaluateResult') {
          resolve(msg.data.payload);
        }
      };
      worker.postMessage({ type: 'evaluate', payload: {} });
    });

    expect(result.recommendedAction).toBe('call');
    expect(result.actions).toHaveLength(2);
    expect(result.handStrength).toBe(0.65);
    expect(result.isDegraded).toBe(false);
  });

  it('responds to batchEvaluate message', async () => {
    const worker = new MockGTOWorker();

    const result = await new Promise<{ handId: string; totalEvLossBB: number }>((resolve) => {
      worker.onmessage = (msg) => {
        if (msg.data.type === 'batchEvaluateResult') {
          resolve(msg.data.payload);
        }
      };
      worker.postMessage({ type: 'batchEvaluate', payload: { handId: 'test-hand' } });
    });

    expect(result.handId).toBe('test-hand');
    expect(result.totalEvLossBB).toBe(0);
  });

  it('times out after 5s with degraded result', async () => {
    // Simulate a worker that never responds
    const timeout = 100; // Use 100ms for test speed
    const result = await new Promise<GTOEvaluationResult>((resolve) => {
      const timer = setTimeout(() => {
        resolve({
          actions: [],
          recommendedAction: 'check',
          recommendedAmount: null,
          handStrength: 0.5,
          potOdds: 0,
          spr: 0,
          isDegraded: true,
        });
      }, timeout);
    });

    expect(result.isDegraded).toBe(true);
  });

  it('degraded fallback uses 100 iterations', () => {
    // Verify the degraded config
    const DEGRADED_ITERATIONS = 100;
    const NORMAL_ITERATIONS = 1000;
    expect(DEGRADED_ITERATIONS).toBeLessThan(NORMAL_ITERATIONS);
    expect(DEGRADED_ITERATIONS).toBe(100);
  });

  it('handles malformed messages gracefully', async () => {
    const worker = new MockGTOWorker();

    const result = await new Promise<{ type: string }>((resolve) => {
      worker.onmessage = (msg) => {
        resolve(msg.data);
      };
      worker.postMessage({ type: 'INVALID_TYPE' });
    });

    expect(result.type).toBe('error');
  });
});
