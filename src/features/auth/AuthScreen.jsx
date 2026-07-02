import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Logo from '../../components/Logo.jsx';

/** Shared centered layout for auth pages: heading, card body, and an optional footer line. */
function AuthScreen({ title, subtitle, children, footer }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link
            to="/"
            aria-label="TestFlow home"
            className="mb-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Logo size={48} withWordmark={false} />
          </Link>
          <h1 className="font-heading text-2xl text-foreground-strong">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-sm text-muted">{subtitle}</p> : null}
        </div>
        <Card padding="lg">{children}</Card>
        {footer ? <div className="mt-6 text-center text-sm text-muted">{footer}</div> : null}
      </div>
    </section>
  );
}

export default AuthScreen;
