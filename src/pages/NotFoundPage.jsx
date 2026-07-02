import { Link } from 'react-router-dom';
import { buttonClasses } from '../components/ui/buttonClasses.js';

function NotFoundPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 px-5 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-12 text-center">
      <p className="font-mono text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl text-foreground-strong">Page not found</h1>
      <p className="max-w-[38ch] text-muted">
        The page you are looking for does not exist or has moved.
      </p>
      <Link to="/" className={buttonClasses({ className: 'mt-2' })}>
        Back to home
      </Link>
    </section>
  );
}

export default NotFoundPage;
