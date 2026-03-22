/**
 * UI Store — manages transient UI state such as modals, active views,
 * notification toasts, and settings that don't persist across sessions.
 */

import { useSyncExternalStore } from 'react';

// ─── Types ───────────────────────────────────────────────────────

export type AppView =
  | 'home'
  | 'game'
  | 'review'
  | 'hand-history'
  | 'stats'
  | 'settings'
  | 'session-list';

export type ModalType =
  | 'none'
  | 'confirm-end-session'
  | 'hand-result'
  | 'session-summary'
  | 'gto-chart'
  | 'settings';

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  durationMs: number;
}

export interface UIStoreState {
  /** Currently active top-level view. */
  activeView: AppView;
  /** Currently open modal (or 'none'). */
  activeModal: ModalType;
  /** Modal payload data (generic object for flexibility). */
  modalData: Record<string, unknown> | null;
  /** Stack of active toast notifications. */
  toasts: Toast[];
  /** Whether the GTO reference panel is expanded. */
  isGTOPanelOpen: boolean;
  /** Whether the action log panel is expanded. */
  isActionLogOpen: boolean;
  /** Selected hand ID for review. */
  selectedHandId: string | null;
  /** Whether dark mode is active. */
  isDarkMode: boolean;
  /** Whether sound effects are enabled. */
  isSoundEnabled: boolean;
}

type Listener = () => void;

// ─── Initial state ───────────────────────────────────────────────

const initialState: UIStoreState = {
  activeView: 'home',
  activeModal: 'none',
  modalData: null,
  toasts: [],
  isGTOPanelOpen: false,
  isActionLogOpen: false,
  selectedHandId: null,
  isDarkMode: true,
  isSoundEnabled: true,
};

// ─── Store implementation ────────────────────────────────────────

let state: UIStoreState = { ...initialState };
const listeners = new Set<Listener>();
let toastCounter = 0;

function setState(partial: Partial<UIStoreState>): void {
  state = { ...state, ...partial };
  listeners.forEach((l) => l());
}

function getState(): UIStoreState {
  return state;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ─── Navigation ──────────────────────────────────────────────────

function navigateTo(view: AppView): void {
  setState({ activeView: view });
}

// ─── Modal management ────────────────────────────────────────────

function openModal(modal: ModalType, data?: Record<string, unknown>): void {
  setState({ activeModal: modal, modalData: data ?? null });
}

function closeModal(): void {
  setState({ activeModal: 'none', modalData: null });
}

// ─── Toast notifications ─────────────────────────────────────────

function showToast(
  message: string,
  type: Toast['type'] = 'info',
  durationMs = 3000,
): string {
  const id = `toast-${++toastCounter}`;
  const toast: Toast = { id, message, type, durationMs };

  setState({ toasts: [...state.toasts, toast] });

  // Auto-dismiss
  if (durationMs > 0) {
    setTimeout(() => dismissToast(id), durationMs);
  }

  return id;
}

function dismissToast(id: string): void {
  setState({ toasts: state.toasts.filter((t) => t.id !== id) });
}

// ─── Panel toggles ───────────────────────────────────────────────

function toggleGTOPanel(): void {
  setState({ isGTOPanelOpen: !state.isGTOPanelOpen });
}

function toggleActionLog(): void {
  setState({ isActionLogOpen: !state.isActionLogOpen });
}

// ─── Review ──────────────────────────────────────────────────────

function selectHand(handId: string | null): void {
  setState({ selectedHandId: handId });
}

// ─── Settings ────────────────────────────────────────────────────

function toggleDarkMode(): void {
  setState({ isDarkMode: !state.isDarkMode });
}

function toggleSound(): void {
  setState({ isSoundEnabled: !state.isSoundEnabled });
}

// ─── Reset ───────────────────────────────────────────────────────

function reset(): void {
  state = { ...initialState };
  listeners.forEach((l) => l());
}

// ─── Public API ──────────────────────────────────────────────────

export const uiStore = {
  getState,
  subscribe,
  navigateTo,
  openModal,
  closeModal,
  showToast,
  dismissToast,
  toggleGTOPanel,
  toggleActionLog,
  selectHand,
  toggleDarkMode,
  toggleSound,
  reset,
};

// ─── React hook ──────────────────────────────────────────────────

export function useUIStore(): UIStoreState;
export function useUIStore<T>(selector: (s: UIStoreState) => T): T;
export function useUIStore<T>(selector?: (s: UIStoreState) => T): T | UIStoreState {
  const snap = useSyncExternalStore(subscribe, getState, getState);
  return selector ? selector(snap) : snap;
}
