// ============================================================
// UI Store — Zustand store for UI state (dialogs, toasts, etc.)
// ============================================================

import { create } from 'zustand';

// ============================================================
// Types
// ============================================================

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface UIState {
  /** Whether the new session dialog is open */
  isNewSessionDialogOpen: boolean;
  /** Whether the session summary modal is open */
  isSessionSummaryOpen: boolean;
  /** Whether the confirm dialog is open */
  isConfirmDialogOpen: boolean;
  /** Confirm dialog config */
  confirmDialogConfig: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null;
  /** Active toasts */
  toasts: Toast[];
  /** Whether the sidebar/nav is collapsed (mobile) */
  isSidebarOpen: boolean;
  /** Current page for navigation tracking */
  currentPage: string;
  /** Whether dark mode is enabled */
  isDarkMode: boolean;
  /** Whether animations are enabled */
  animationsEnabled: boolean;
  /** Whether sound effects are enabled */
  soundEnabled: boolean;
}

export interface UIActions {
  /** Open the new session dialog */
  openNewSessionDialog: () => void;
  /** Close the new session dialog */
  closeNewSessionDialog: () => void;
  /** Open the session summary modal */
  openSessionSummary: () => void;
  /** Close the session summary modal */
  closeSessionSummary: () => void;
  /** Show a confirm dialog */
  showConfirmDialog: (config: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  /** Close the confirm dialog */
  closeConfirmDialog: () => void;
  /** Add a toast notification */
  addToast: (type: ToastType, message: string, duration?: number) => void;
  /** Remove a toast by ID */
  removeToast: (id: string) => void;
  /** Toggle sidebar */
  toggleSidebar: () => void;
  /** Set current page */
  setCurrentPage: (page: string) => void;
  /** Toggle dark mode */
  toggleDarkMode: () => void;
  /** Toggle animations */
  toggleAnimations: () => void;
  /** Toggle sound */
  toggleSound: () => void;
  /** Reset the store */
  reset: () => void;
}

export type UIStore = UIState & UIActions;

// ============================================================
// Initial state
// ============================================================

const initialState: UIState = {
  isNewSessionDialogOpen: false,
  isSessionSummaryOpen: false,
  isConfirmDialogOpen: false,
  confirmDialogConfig: null,
  toasts: [],
  isSidebarOpen: false,
  currentPage: 'dashboard',
  isDarkMode: true,
  animationsEnabled: true,
  soundEnabled: true,
};

// ============================================================
// Toast ID generator
// ============================================================

let toastIdCounter = 0;

function generateToastId(): string {
  return `toast-${++toastIdCounter}-${Date.now()}`;
}

// ============================================================
// Store
// ============================================================

export const useUIStore = create<UIStore>((set, get) => ({
  ...initialState,

  openNewSessionDialog: () => set({ isNewSessionDialogOpen: true }),
  closeNewSessionDialog: () => set({ isNewSessionDialogOpen: false }),

  openSessionSummary: () => set({ isSessionSummaryOpen: true }),
  closeSessionSummary: () => set({ isSessionSummaryOpen: false }),

  showConfirmDialog: (config) =>
    set({ isConfirmDialogOpen: true, confirmDialogConfig: config }),

  closeConfirmDialog: () =>
    set({ isConfirmDialogOpen: false, confirmDialogConfig: null }),

  addToast: (type: ToastType, message: string, duration = 4000) => {
    const id = generateToastId();
    const toast: Toast = { id, type, message, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setCurrentPage: (page: string) => set({ currentPage: page }),

  toggleDarkMode: () =>
    set((state) => ({ isDarkMode: !state.isDarkMode })),

  toggleAnimations: () =>
    set((state) => ({ animationsEnabled: !state.animationsEnabled })),

  toggleSound: () =>
    set((state) => ({ soundEnabled: !state.soundEnabled })),

  reset: () => set(initialState),
}));
