import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, LogOut, Menu, X } from 'lucide-react';
import Logo from '../../components/Logo.jsx';
import { cn } from '../../utils/cn.js';
import { ICON } from '../../components/ui/iconProps.js';
import { authApi } from '../auth/api.js';
import { useAuth } from '../auth/useAuth.js';
import { WORKSPACE_NAV } from './workspaceNav.js';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

/**
 * Phone navigation for the organisation workspace (hidden from lg up, where the sidebar takes over).
 * A sticky top bar with a hamburger opens the same menu as the desktop sidebar in a slide-in drawer.
 */
function WorkspaceMobileNav({ orgName }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const closeRef = useRef(null);
  const openerRef = useRef(null);

  // While open: Escape closes, the page behind does not scroll, focus moves into the drawer then back.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    const opener = openerRef.current;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, [open]);

  const exitToStudent = () => {
    setOpen(false);
    authApi.switchProduct('student').catch(() => {});
    navigate('/dashboard');
  };

  const signOut = async () => {
    setOpen(false);
    await logout();
  };

  return (
    <div className="lg:hidden">
      {/* Fixed to the top of the screen; the spacer keeps the page content from sliding underneath it. */}
      <div aria-hidden="true" className="h-[calc(3.5rem+var(--safe-top))]" />
      <header className="fixed inset-x-0 top-0 z-30 flex h-[calc(3.5rem+var(--safe-top))] items-center gap-2 border-b border-border bg-background/95 px-3 pt-[var(--safe-top)] backdrop-blur">
        <button
          ref={openerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="workspace-drawer"
          className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl text-foreground hover:bg-black/[0.05]', focusRing)}
        >
          <Menu {...ICON} size={22} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-foreground">{orgName || 'Workspace'}</p>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              className="fixed inset-0 z-[60] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              id="workspace-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Workspace menu"
              className="fixed inset-y-0 left-0 z-[61] flex w-[min(86vw,320px)] flex-col bg-surface shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            >
              <div className="flex h-14 shrink-0 items-center justify-between pl-4 pr-2">
                <Logo size={26} withWordmark={false} />
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className={cn('flex size-10 items-center justify-center rounded-xl text-foreground hover:bg-black/[0.05]', focusRing)}
                >
                  <X {...ICON} size={22} />
                </button>
              </div>

              <p className="truncate px-4 pb-2 text-[13px] text-muted">{orgName || 'Your organisation'}</p>

              <nav aria-label="Workspace sections" className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
                <ul className="flex flex-col gap-0.5">
                  {WORKSPACE_NAV.map(({ to, label, Icon, end }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        end={end}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] text-foreground transition-colors hover:bg-black/[0.04]',
                            focusRing,
                            isActive && 'bg-[var(--brand-lavender)]/70 font-semibold text-[var(--brand-ink)]',
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon {...ICON} size={19} className={cn('shrink-0', isActive && 'text-[var(--brand-indigo)]')} />
                            <span className="truncate">{label}</span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="shrink-0 space-y-1 border-t border-black/[0.06] p-3 pb-[calc(0.75rem+var(--safe-bottom))]">
                <button
                  type="button"
                  onClick={exitToStudent}
                  className={cn('flex h-11 w-full items-center justify-start gap-3 rounded-xl px-3 text-[15px] text-foreground hover:bg-black/[0.04]', focusRing)}
                >
                  <ArrowLeft {...ICON} size={19} /> Back to Testflow CBT
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className={cn('flex h-11 w-full items-center justify-start gap-3 rounded-xl px-3 text-[15px] text-danger hover:bg-danger/10', focusRing)}
                >
                  <LogOut {...ICON} size={19} /> Sign out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WorkspaceMobileNav;
