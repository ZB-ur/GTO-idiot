// ============================================================
// GTO Client — Main-thread interface to the GTO Web Worker
// ============================================================
//
// Provides a clean async API for evaluating decisions against GTO
// strategy. Manages Web Worker lifecycle, request/response mapping,
// timeout handling, and fallback to synchronous heuristic.

import type { GTOEvaluationRequest, GTOEvaluationResult } from '../types';
import { evaluatePostflop, type PostflopContext } from './postflop-heuristic';
import type { WorkerRequest, WorkerResponse, WorkerEvaluatePayload } from './gto-worker';
import type { Card } from '../types';

const DEFAULT_TIMEOUT_MS = 5000;
const WORKER_URL = new URL('./gto-worker.ts', import.meta.url);

interface PendingRequest {
  resolve: (result: GTOEvaluationResult) => void;
  reject: (error: Error) => void;
  timerId: ReturnType<typeof setTimeout>;
}

/**
 * GTOClient manages a Web Worker for GTO evaluation and provides
 * automatic timeout/fallback behavior.
 */
export class GTOClient {
  private worker: Worker | null = null;
  private pending = new Map<string, PendingRequest>();
  private requestCounter = 0;
  private workerReady = false;
  private timeoutMs: number;

  constructor(timeoutMs: number = DEFAULT_TIMEOUT_MS) {
    this.timeoutMs = timeoutMs;
  }

  /**
   * Initialize the Web Worker. Safe to call multiple times.
   */
  init(): void {
    if (this.worker) return;

    try {
      this.worker = new Worker(WORKER_URL, { type: 'module' });
      this.worker.addEventListener('message', this.handleWorkerMessage);
      this.worker.addEventListener('error', this.handleWorkerError);
      this.workerReady = true;
    } catch {
      // Web Workers not available (SSR, test environment, etc.)
      this.workerReady = false;
    }
  }

  /**
   * Evaluate a decision point against GTO strategy.
   * Runs in Web Worker if available, falls back to synchronous heuristic.
   */
  async evaluate(request: GTOEvaluationRequest): Promise<GTOEvaluationResult> {
    const context = requestToContext(request);

    // If worker isn't available, fall back to sync heuristic
    if (!this.workerReady || !this.worker) {
      return evaluatePostflop(context);
    }

    return this.sendToWorker(context);
  }

  /**
   * Evaluate a decision synchronously using the heuristic engine.
   * Useful when you don't want to wait for Monte Carlo.
   */
  evaluateSync(request: GTOEvaluationRequest): GTOEvaluationResult {
    const context = requestToContext(request);
    return evaluatePostflop(context);
  }

  /**
   * Terminate the Web Worker and clean up resources.
   */
  dispose(): void {
    if (this.worker) {
      this.worker.removeEventListener('message', this.handleWorkerMessage);
      this.worker.removeEventListener('error', this.handleWorkerError);
      this.worker.terminate();
      this.worker = null;
      this.workerReady = false;
    }

    // Reject all pending requests
    for (const [_id, pending] of this.pending) {
      clearTimeout(pending.timerId);
      pending.reject(new Error('GTOClient disposed'));
    }
    this.pending.clear();
  }

  /**
   * Check if the Web Worker is available and ready.
   */
  get isWorkerAvailable(): boolean {
    return this.workerReady;
  }

  // ============================================================
  // Private methods
  // ============================================================

  private sendToWorker(context: PostflopContext): Promise<GTOEvaluationResult> {
    return new Promise<GTOEvaluationResult>((resolve, reject) => {
      const id = `gto-${++this.requestCounter}`;

      const timerId = setTimeout(() => {
        this.pending.delete(id);
        // Timeout: fall back to heuristic
        resolve(evaluatePostflop(context));
      }, this.timeoutMs);

      this.pending.set(id, { resolve, reject, timerId });

      const payload: WorkerEvaluatePayload = {
        context,
        config: {
          timeoutMs: this.timeoutMs - 200, // Give worker slightly less time
          iterations: 1000,
        },
      };

      const request: WorkerRequest = {
        id,
        type: 'evaluate',
        payload,
      };

      this.worker!.postMessage(request);
    });
  }

  private handleWorkerMessage = (event: MessageEvent<WorkerResponse>): void => {
    const response = event.data;
    const pending = this.pending.get(response.id);
    if (!pending) return;

    this.pending.delete(response.id);
    clearTimeout(pending.timerId);

    if (response.type === 'result') {
      pending.resolve(response.payload as GTOEvaluationResult);
    } else {
      const error = response.payload as { message: string };
      pending.reject(new Error(error.message));
    }
  };

  private handleWorkerError = (event: ErrorEvent): void => {
    // On worker error, reject all pending requests with heuristic fallback
    for (const [_id, pending] of this.pending) {
      clearTimeout(pending.timerId);
      pending.reject(new Error(`Worker error: ${event.message}`));
    }
    this.pending.clear();

    // Worker is broken, mark as unavailable
    this.workerReady = false;
  };
}

// ============================================================
// Helpers
// ============================================================

function requestToContext(req: GTOEvaluationRequest): PostflopContext {
  return {
    holeCards: req.holeCards as [Card, Card],
    communityCards: req.communityCards,
    position: req.position,
    potBB: req.potBB,
    stackBB: req.stackBB,
    street: req.street,
    activePlayers: req.activePlayers ?? 2,
    actionHistory: req.actionHistory,
  };
}

// ============================================================
// Singleton instance for convenience
// ============================================================

let defaultClient: GTOClient | null = null;

/**
 * Get or create the default GTOClient singleton.
 */
export function getGTOClient(): GTOClient {
  if (!defaultClient) {
    defaultClient = new GTOClient();
    defaultClient.init();
  }
  return defaultClient;
}

/**
 * Dispose the default GTOClient singleton.
 */
export function disposeGTOClient(): void {
  if (defaultClient) {
    defaultClient.dispose();
    defaultClient = null;
  }
}
