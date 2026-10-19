import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const ToastContext = createContext(null);

const variants = {
  info: { Icon: Info, ring: 'text-info' },
  success: { Icon: CheckCircle2, ring: 'text-success' },
  warning: { Icon: AlertTriangle, ring: 'text-warning' },
  danger: { Icon: AlertCircle, ring: 'text-danger' },
};

function ToastItem({ toast, onClose }) {
  const { Icon, ring } = variants[toast.variant] ?? variants.info;
  const timer = useRef(null);
  const arm = () => {
    clearTimeout(timer.current);
    if (toast.duration > 0) timer.current = setTimeout(() => onClose(toast.id), toast.duration);
  };
  // Arm on mount via ref callback; pause while hovered or focused so it can be read.
  const setRef = (node) => {
    if (node) arm();
    else clearTimeout(timer.current);
  };
  return (
    <li
      ref={setRef}
      onMouseEnter={() => clearTimeout(timer.current)}
      onMouseLeave={arm}
      onFocus={() => clearTimeout(timer.current)}
      onBlur={arm}
      className="tf-toast pointer-events-auto flex w-fit min-w-[15rem] max-w-[min(22rem,calc(100vw-2rem))] items-start gap-2.5 rounded-2xl border border-border bg-surface py-2.5 pl-3.5 pr-2.5 shadow-[0_10px_30px_-12px_rgba(27,67,50,0.3)]"
    >
      <Icon size={18} strokeWidth={1.8} aria-hidden="true" className={cn('mt-0.5 shrink-0', ring)} />
      <div className="min-w-0 flex-1">
        {toast.title && <p className="text-sm font-semibold leading-5 text-foreground-strong">{toast.title}</p>}
        {toast.description && <p className={cn('text-[13px] leading-[18px] text-muted', toast.title && 'mt-0.5')}>{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        aria-label="Dismiss notification"
        className="-my-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-strong hover:text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </li>
  );
}

/** Mount once near the app root. Use `useToast()` anywhere below it. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);
  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const toast = useCallback((input) => {
    const id = ++counter.current;
    const next = typeof input === 'string' ? { title: input } : input;
    setToasts((list) => [...list.slice(-3), { id, variant: 'info', duration: 3500, ...next }]);
    return id;
  }, []);
  const api = useMemo(
    () => ({
      toast,
      dismiss,
      success: (title, description) => toast({ title, description, variant: 'success' }),
      error: (title, description) => toast({ title, description, variant: 'danger', duration: 6000 }),
      warning: (title, description) => toast({ title, description, variant: 'warning', duration: 5000 }),
      info: (title, description) => toast({ title, description, variant: 'info' }),
    }),
    [toast, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ol
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 px-4 pb-[calc(1rem+var(--safe-bottom))] sm:pb-6"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={dismiss} />
        ))}
      </ol>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
