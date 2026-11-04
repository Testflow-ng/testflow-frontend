import { Link } from 'react-router-dom';
import { buttonClasses } from '../components/ui/buttonClasses.js';
import NotFoundTv from '../components/brand/NotFoundTv.jsx';

function NotFoundPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-2 overflow-x-clip px-4 pb-12 pt-6 text-center tf-nav-clearance">
      <NotFoundTv />
      <p className="font-mono text-[13px] font-bold uppercase tracking-[0.2em] text-muted">404</p>
      <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground-strong">Page not found</h1>
      <p className="max-w-[34ch] text-sm leading-relaxed text-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className={buttonClasses({ size: 'lg', className: 'mt-4 px-8' })}>
        Back to home
      </Link>
    </section>
  );
}

export default NotFoundPage;
