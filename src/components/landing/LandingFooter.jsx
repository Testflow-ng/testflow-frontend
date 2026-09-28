import { Link } from 'react-router-dom';
import Logo from '../Logo.jsx';

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Subjects', to: '/#subjects' },
      { label: 'How it works', to: '/#how-it-works' },
      { label: 'Get started', to: '/' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'Create account', to: '/register' },
      { label: 'Forgot password', to: '/forgot-password' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Terms and conditions', to: '/terms' },
      { label: 'Contact', href: 'mailto:hello@testflow.com.ng' },
    ],
  },
];

function LandingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-surface">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-4 select-none text-center font-heading text-[22vw] font-extrabold leading-none tracking-tighter text-foreground-strong/[0.04] sm:-bottom-8 sm:text-[20vw]"
      >
        TESTFLOW
      </span>
      <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Logo size={28} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              High-fidelity CBT practice for OAU students, built by Eddyrus
              Media.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <h3 className="text-xs font-bold uppercase tracking-wide text-foreground-strong">
                {column.heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-muted transition-colors hover:text-foreground-strong"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-sm text-muted transition-colors hover:text-foreground-strong"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Eddyrus Media. Built for OAU.
          </p>
          <p className="text-xs text-muted">Made in Nigeria</p>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
