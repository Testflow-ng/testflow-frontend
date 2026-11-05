import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Building2, Menu, X } from 'lucide-react';
import Logo from '../Logo.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { useOrganizations } from '../../features/workspace/useWorkspace.js';
import { LOGIN_PATH, REGISTER_PATH } from '../../features/auth/paths.js';

const DEFAULT_LINKS = [
  { to: '/#approach', label: 'Our approach' },
  { to: '/#subjects', label: 'Courses' },
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/#faq', label: 'FAQs' },
  { to: '/ads', label: 'Advertise' },
];

function LandingNav({
  links = DEFAULT_LINKS,
  loginTo = LOGIN_PATH,
  primary = { to: REGISTER_PATH, label: 'Get started' },
  dashboardTo = '/dashboard',
  dashboardLabel = 'Dashboard',
}) {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { data: orgs } = useOrganizations();
  const hasOrg = Boolean(Array.isArray(orgs) && orgs.length > 0);
  const org = hasOrg ? orgs[0] : null;

  const isEverybodyPage = pathname.startsWith('/everybody') || dashboardTo === '/workspace';

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  const authTarget = isEverybodyPage
    ? hasOrg
      ? { to: '/workspace', label: 'Open Workspace' }
      : { to: '/everybody/start', label: 'Launch your CBT' }
    : { to: '/dashboard', label: 'Dashboard' };

  return (
    <div className="nav-shell">
      <header className="container nav">
        <Link to="/" className="logo" aria-label="Testflow home">
          <Logo size={28} withWordmark={false} />
          Testflow
        </Link>
        <nav aria-label="Main">
          {links.map(({ to, label }) => (
            <Link key={label} to={to}>
              {label}
            </Link>
          ))}
          {isAuthenticated && hasOrg && !isEverybodyPage && (
            <Link to="/workspace" className="flex items-center gap-1 font-semibold text-primary">
              <Building2 size={14} /> Workspace
            </Link>
          )}
        </nav>
        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {isEverybodyPage ? (
                <Link to="/dashboard" className="login text-xs font-semibold">
                  Student Dashboard
                </Link>
              ) : hasOrg ? (
                <Link to="/workspace" className="login text-xs font-semibold">
                  {org.name} Workspace
                </Link>
              ) : null}
              <Link to={authTarget.to} className="btn btn-primary">
                {authTarget.label} <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <>
              <Link to={loginTo} className="login">
                Log in
              </Link>
              <Link to={primary.to} className="btn btn-primary">
                {primary.label} <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </>
          )}
          <button
            type="button"
            className="menu-btn"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="landing-mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </header>
      {open && (
        <div id="landing-mobile-menu" className="container mobile-menu">
          {links.map(({ to, label }) => (
            <Link key={label} to={to} onClick={close}>
              {label}
            </Link>
          ))}
          {isAuthenticated ? (
            <div className="flex flex-col gap-2 pt-2">
              <Link to={authTarget.to} className="btn btn-primary" onClick={close}>
                {authTarget.label} <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
              {isEverybodyPage ? (
                <Link to="/dashboard" onClick={close} className="text-center text-sm font-semibold text-muted">
                  ← Go to Student Dashboard
                </Link>
              ) : hasOrg ? (
                <Link to="/workspace" onClick={close} className="text-center text-sm font-semibold text-primary">
                  Go to {org.name} Workspace →
                </Link>
              ) : null}
            </div>
          ) : (
            <>
              <Link to={loginTo} onClick={close}>
                Log in
              </Link>
              <Link to={primary.to} className="btn btn-primary" onClick={close}>
                {primary.label} <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default LandingNav;
