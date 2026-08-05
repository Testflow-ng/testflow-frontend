import { Link } from 'react-router-dom';
import Logo from '../../components/Logo.jsx';

function AuthScreen({ title, subtitle, children, footer }) {
  return (
    <section className="flex flex-1 flex-col items-center px-5 pb-12 pt-8 sm:justify-center sm:pt-0">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            to="/"
            aria-label="TestFlow home"
            className="mb-5 rounded-xl p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Logo size={44} withWordmark={false} />
          </Link>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          {children}
        </div>
        {footer && (
          <p className="mt-6 text-center text-sm text-muted">{footer}</p>
        )}
      </div>
    </section>
  );
}

export default AuthScreen;
