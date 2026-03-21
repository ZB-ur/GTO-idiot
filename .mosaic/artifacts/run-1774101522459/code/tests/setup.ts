// ============================================================
// Test setup — fake-indexeddb + jest-dom matchers
// ============================================================

import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';

// Mock Web Worker API for non-worker tests
class MockWorker {
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onerror: ((ev: ErrorEvent) => void) | null = null;

  postMessage(_data: unknown): void {
    // No-op in mock
  }

  terminate(): void {
    // No-op in mock
  }

  addEventListener(_type: string, _listener: EventListener): void {
    // No-op
  }

  removeEventListener(_type: string, _listener: EventListener): void {
    // No-op
  }

  dispatchEvent(_event: Event): boolean {
    return true;
  }
}

// @ts-expect-error — Polyfilling Worker for jsdom
globalThis.Worker = MockWorker;
