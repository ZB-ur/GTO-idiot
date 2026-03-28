import { useEffect, useState, useCallback } from 'react';

export interface ToastMessage {
  readonly id: string;
  readonly text: string;
  readonly type: 'info' | 'success' | 'error' | 'warning';
  readonly duration?: number;
}

interface ToastProps {
  readonly message: ToastMessage;
  readonly onDismiss: (id: string) => void;
}

function ToastItem({ message, onDismiss }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const duration = message.duration ?? 3000;
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(message.id), 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  const bgColor = {
    info: 'bg-blue-600',
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
  }[message.type];

  const icon = {
    info: 'ℹ',
    success: '✓',
    error: '✗',
    warning: '⚠',
  }[message.type];

  return (
    <div
      className={`flex items-center gap-2 rounded-lg ${bgColor} px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 ${
        exiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="flex-1">{message.text}</span>
      <button
        onClick={() => onDismiss(message.id)}
        className="ml-2 rounded p-0.5 text-white/70 hover:text-white"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Toast container with state management ──────────────────────────

let addToastGlobal: ((msg: Omit<ToastMessage, 'id'>) => void) | null = null;

export function toast(text: string, type: ToastMessage['type'] = 'info', duration?: number) {
  addToastGlobal?.({ text, type, duration });
}

export function ToastContainer() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setMessages((prev) => [...prev, { ...msg, id }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  useEffect(() => {
    addToastGlobal = addToast;
    return () => { addToastGlobal = null; };
  }, [addToast]);

  if (messages.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[60] flex flex-col gap-2">
      {messages.map((msg) => (
        <ToastItem key={msg.id} message={msg} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
