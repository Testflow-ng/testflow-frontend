import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, LogOut, X } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { buttonClasses } from './ui/index.js';
import ThemeToggle from './ThemeToggle.jsx';

/**
 * Full-screen mobile menu sheet. Nav links stacked, a divider, then the
 * primary auth actions as pill buttons.
 */
function NavDrawer({ open, onClose, links, isAuthenticated, onSignOut }) {
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
        className="absolute inset-0 bg-background/70 backdrop-blur-md"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        tabIndex={-1}
        className="absolute inset-x-3 top-3 flex max-h-[calc(100svh-1.5rem)] flex-col rounded-3xl border border-border bg-surface p-5 shadow-2xl focus:outline-none"
      >
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-full text-foreground-strong transition-colors hover:bg-surface-strong"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <nav className="mt-2 flex flex-col overflow-y-auto">
          {links.map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={label}
                to={to}
                onClick={onClose}
                className={cn(
                  'rounded-2xl px-3 py-4 text-xl font-semibold tracking-tight transition-colors',
                  isActive
                    ? 'text-foreground-strong'
                    : 'text-muted hover:text-foreground-strong',
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-2 border-t border-border pt-5">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut?.();
              }}
              className={buttonClasses({
                variant: 'outline',
                size: 'lg',
                fullWidth: true,
                className: 'gap-2 text-danger',
              })}
            >
              <LogOut size={18} aria-hidden="true" />
              Sign out
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={onClose}
                className={buttonClasses({
                  variant: 'outline',
                  size: 'lg',
                  fullWidth: true,
                })}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className={buttonClasses({
                  size: 'lg',
                  fullWidth: true,
                  className: 'gap-2',
                })}
              >
                Get started
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default NavDrawer;
