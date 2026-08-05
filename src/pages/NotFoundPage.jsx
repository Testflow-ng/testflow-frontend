import { Link } from 'react-router-dom';
import { buttonClasses } from '../components/ui/buttonClasses.js';

function NotFoundPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-3 px-5 pb-28 pt-12 text-center lg:pb-12">
      <p className="font-heading text-7xl font-extrabold tracking-tight text-primary/20">
        404
      </p>
      <h1 className="text-xl font-bold text-foreground-strong">
        Page not found
      </h1>
      <p className="max-w-[32ch] text-sm text-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className={buttonClasses({ className: 'mt-4' })}>
        Back to home
      </Link>
    </section>
  );
}

export default NotFoundPage;
