import { Link } from 'react-router-dom';
import Logo from '../Logo.jsx';

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', to: '/features' },
      { label: 'Subjects', to: '/#subjects' },
      { label: 'How it works', to: '/#how-it-works' },
      { label: 'Get started', to: '/register' },
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
      {
        label: 'Privacy policy',
        href: 'https://ferousco-dev.github.io/testflow-policy/privacy.html',
      },
      {
        label: 'Terms of service',
        href: 'https://ferousco-dev.github.io/testflow-policy/terms.html',
      },
      { label: 'Contact', href: 'mailto:feranmioresajo@gmail.com' },
    ],
  },
];

function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
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
