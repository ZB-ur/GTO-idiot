// ============================================================
// GTO Idiot — CFR Web Worker
// Runs the postflop CFR solver off the main thread.
// Communication via structured postMessage protocol.
// ============================================================

import { solvePostflop, type SolverOptions, type SolverResult } from './postflop-solver';
import type { PostflopSolveRequest } from '../types';

// ---------- Message protocol ----------

export interface CFRWorkerRequest {
  type: 'solve';
  id: string;
  payload: PostflopSolveRequest;
  options?: Partial<SolverOptions>;
}

export interface CFRWorkerResponse {
  type: 'result';
  id: string;
  result: SolverResult;
}

export interface CFRWorkerError {
  type: 'error';
  id: string;
  error: string;
}

export type CFRWorkerMessage = CFRWorkerRequest;
export type CFRWorkerReply = CFRWorkerResponse | CFRWorkerError;

// ---------- Worker entry point ----------

// Only run worker logic when in a Worker context
const isWorkerContext =
  typeof self !== 'undefined' &&
  typeof (self as unknown as { postMessage: unknown }).postMessage === 'function' &&
  typeof window === 'undefined';

if (isWorkerContext) {
  self.onmessage = (event: MessageEvent<CFRWorkerMessage>) => {
    const message = event.data;

    if (message.type === 'solve') {
      try {
        const result = solvePostflop(message.payload, message.options);
        const reply: CFRWorkerResponse = {
          type: 'result',
          id: message.id,
          result,
        };
        self.postMessage(reply);
      } catch (err) {
        const reply: CFRWorkerError = {
          type: 'error',
          id: message.id,
          error: err instanceof Error ? err.message : String(err),
        };
        self.postMessage(reply);
      }
    }
  };
}

// ---------- Worker client (for main thread use) ----------

/**
 * Client wrapper for communicating with the CFR Web Worker.
 * Manages worker lifecycle and provides a Promise-based API.
 */
export class CFRWorkerClient {
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, {
    resolve: (result: SolverResult) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }>();
  private requestCounter = 0;

  /** Default timeout for solver requests (ms) */
  private readonly defaultTimeout: number;

  constructor(timeout = 2000) {
    this.defaultTimeout = timeout;
  }

  /**
   * Initialize the Web Worker.
   * Call this before sending solve requests.
   */
  init(): void {
    if (this.worker) return;

    try {
      // Create worker from the same module
      this.worker = new Worker(
        new URL('./cfr-worker.ts', import.meta.url),
        { type: 'module' },
      );

      this.worker.onmessage = (event: MessageEvent<CFRWorkerReply>) => {
        this.handleMessage(event.data);
      };

      this.worker.onerror = (event) => {
        console.error('[CFRWorker] Worker error:', event.message);
        // Reject all pending requests
        for (const [, pending] of this.pendingRequests) {
          clearTimeout(pending.timer);
          pending.reject(new Error(`Worker error: ${event.message}`));
        }
        this.pendingRequests.clear();
      };
    } catch (err) {
      console.warn('[CFRWorker] Failed to create Web Worker, will use main-thread fallback');
      this.worker = null;
    }
  }

  /**
   * Solve a postflop situation using the Web Worker.
   * Falls back to main-thread computation if Worker is unavailable.
   */
  async solve(
    request: PostflopSolveRequest,
    options?: Partial<SolverOptions>,
  ): Promise<SolverResult> {
    // Fallback to main thread if worker is not available
    if (!this.worker) {
      return solvePostflop(request, options);
    }

    const id = `cfr-${++this.requestCounter}`;

    return new Promise<SolverResult>((resolve, reject) => {
      const timeoutMs = options?.timeBudgetMs ?? this.defaultTimeout;

      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        // On timeout, fall back to main thread with reduced iterations
        try {
          const fallbackResult = solvePostflop(request, {
            ...options,
            maxIterations: 100,
            timeBudgetMs: 200,
          });
          resolve(fallbackResult);
        } catch (err) {
          reject(new Error('CFR solver timeout'));
        }
      }, timeoutMs + 500); // Give worker a bit more time than the solver's own budget

      this.pendingRequests.set(id, { resolve, reject, timer });

      const message: CFRWorkerRequest = {
        type: 'solve',
        id,
        payload: request,
        options,
      };

      this.worker!.postMessage(message);
    });
  }

  /**
   * Terminate the Web Worker and clean up resources.
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timer);
      pending.reject(new Error('Worker terminated'));
    }
    this.pendingRequests.clear();
  }

  /** Whether the worker is active */
  get isActive(): boolean {
    return this.worker !== null;
  }

  private handleMessage(reply: CFRWorkerReply): void {
    const pending = this.pendingRequests.get(reply.id);
    if (!pending) return;

    clearTimeout(pending.timer);
    this.pendingRequests.delete(reply.id);

    if (reply.type === 'error') {
      pending.reject(new Error(reply.error));
    } else {
      pending.resolve(reply.result);
    }
  }
}

// ---------- Singleton instance ----------

let _defaultClient: CFRWorkerClient | null = null;

/**
 * Get the default CFR Worker client (singleton).
 * Auto-initializes on first call.
 */
export function getCFRWorkerClient(): CFRWorkerClient {
  if (!_defaultClient) {
    _defaultClient = new CFRWorkerClient();
    _defaultClient.init();
  }
  return _defaultClient;
}

/**
 * Convenience: solve postflop using the default worker client.
 */
export async function solvePostflopAsync(
  request: PostflopSolveRequest,
  options?: Partial<SolverOptions>,
): Promise<SolverResult> {
  const client = getCFRWorkerClient();
  return client.solve(request, options);
}
