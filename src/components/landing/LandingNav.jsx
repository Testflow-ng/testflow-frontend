import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Logo from '../Logo.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { COMING_SOON_PATH } from '../../features/waitlist/waitlist.js';

const NAV_LINKS = [
  { to: '/#approach', label: 'Our approach' },
  { to: '/#subjects', label: 'Courses' },
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/#faq', label: 'FAQs' },
];

function LandingNav() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="nav-shell">
      <header className="container nav">
        <Link to="/" className="logo" aria-label="Testflow home">
          <Logo size={28} withWordmark={false} />
          Testflow
        </Link>
        <nav aria-label="Main">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={label} to={to}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">
              Dashboard <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link to={COMING_SOON_PATH} className="login">
                Log in
              </Link>
              <Link to={COMING_SOON_PATH} className="btn btn-primary">
                Get started <ArrowUpRight size={14} aria-hidden="true" />
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
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={label} to={to} onClick={close}>
              {label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary" onClick={close}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link to={COMING_SOON_PATH} onClick={close}>
                Log in
              </Link>
              <Link to={COMING_SOON_PATH} className="btn btn-primary" onClick={close}>
                Get started <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default LandingNav;
