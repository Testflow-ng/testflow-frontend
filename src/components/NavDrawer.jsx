import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, X, Sun } from 'lucide-react';
import { cn } from '../utils/cn.js';
import IconButton from './ui/IconButton.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import Logo from './Logo.jsx';

const ITEM_CLASS =
  'flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-base font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

/**
 * Slide-in navigation drawer. Redesigned to feel premium.
 */
function NavDrawer({ open, onClose, links, onSignOut }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (!open) return undefined;
    previouslyFocused.current = document.activeElement;
    panelRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[600]">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/20 backdrop-blur-md transition-opacity duration-500"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        tabIndex={-1}
        className={cn(
          "absolute inset-y-0 right-0 flex w-80 max-w-[85%] flex-col bg-surface shadow-2xl transition-transform duration-500 ease-out focus:outline-none",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-display text-lg font-bold text-foreground-strong">TestFlow</span>
          </div>
          <IconButton variant="ghost" aria-label="Close menu" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <nav className="flex flex-col gap-2">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted">Navigation</p>
            {links.map(({ to, label, Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={label}
                  to={to}
                  onClick={onClose}
                  className={cn(
                    ITEM_CLASS,
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                      : 'text-muted hover:text-foreground-strong hover:bg-surface-strong'
                  )}
                >
                  <Icon size={20} className={cn("shrink-0", isActive ? "text-primary" : "text-muted")} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 space-y-2">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted">Settings</p>
            <div className="flex items-center justify-between rounded-xl bg-surface-strong px-4 py-3">
              <div className="flex items-center gap-3">
                <Sun size={20} className="text-muted" />
                <span className="text-sm font-semibold text-foreground-strong">Theme</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-surface-strong/30">
          {onSignOut && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className={cn(ITEM_CLASS, 'text-danger hover:bg-danger/10')}
            >
              <LogOut size={20} className="shrink-0" aria-hidden="true" />
              Sign out
            </button>
          )}
          <p className="mt-4 text-center text-[10px] text-muted">
            TestFlow v1.0.0 &bull; Eddyrus Media
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default NavDrawer;
