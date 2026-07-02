import Card from '../../components/ui/Card.jsx';

/** Shared centered layout for auth pages: heading, card body, and an optional footer line. */
function AuthScreen({ title, subtitle, children, footer }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl text-foreground-strong">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-sm text-muted">{subtitle}</p> : null}
        </div>
        <Card padding="lg">{children}</Card>
        {footer ? <div className="mt-6 text-center text-sm text-muted">{footer}</div> : null}
      </div>
    </section>
  );
}

export default AuthScreen;
