import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { cn } from '../utils/cn.js';
import IconButton from './ui/IconButton.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import Logo from './Logo.jsx';

const ITEM_CLASS =
  'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

/**
 * Slide-in navigation drawer opened by the header hamburger. Escape closes it,
 * body scroll locks while open, and focus returns to the trigger on close.
 * `links` are { to, label, Icon }; `onSignOut` (optional) renders in the footer.
 */
function NavDrawer({ open, onClose, links, onSignOut }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

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
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/50 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-72 max-w-[80%] flex-col border-l border-border bg-surface p-5 shadow-xl focus:outline-none"
      >
        <div className="flex items-center justify-between">
          <Logo size={26} />
          <IconButton size="sm" aria-label="Close menu" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </IconButton>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          {links.map(({ to, label, Icon }) => (
            <Link
              key={label}
              to={to}
              onClick={onClose}
              className={cn(ITEM_CLASS, 'text-foreground hover:bg-surface-strong')}
            >
              <Icon size={18} className="shrink-0 text-muted" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
          {onSignOut && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className={cn(ITEM_CLASS, 'text-danger hover:bg-danger/10')}
            >
              <LogOut size={18} className="shrink-0" aria-hidden="true" />
              Sign out
            </button>
          )}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm text-muted">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default NavDrawer;
