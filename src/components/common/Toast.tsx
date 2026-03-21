// ============================================================
// GTO Idiot — Toast Notification Component
// Renders toast stack from UI store
// ============================================================

import { useUIStore, type Toast as ToastData } from '../../stores/ui-store';

const iconMap: Record<ToastData['type'], string> = {
  success: '\u2713',
  error: '\u2717',
  warning: '\u26A0',
  info: '\u2139',
};

const colorMap: Record<ToastData['type'], string> = {
  success: 'border-green-500 bg-green-500/10 text-green-400',
  error: 'border-red-500 bg-red-500/10 text-red-400',
  warning: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
  info: 'border-blue-500 bg-blue-500/10 text-blue-400',
};

function ToastItem({ toast }: { toast: ToastData }) {
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border-l-4 px-4 py-3 shadow-lg backdrop-blur-sm ${colorMap[toast.type]}`}
      role="alert"
    >
      <span className="text-lg">{iconMap[toast.type]}</span>
      <span className="flex-1 text-sm">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="ml-2 text-gray-400 transition hover:text-white"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
