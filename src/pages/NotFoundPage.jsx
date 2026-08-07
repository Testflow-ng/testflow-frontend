import { Link } from 'react-router-dom';
import { buttonClasses } from '../components/ui/buttonClasses.js';
import Mascot from '../components/brand/Mascot.jsx';
import { MOMENTS } from '../components/brand/mascotMood.js';

function NotFoundPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-3 pt-12 text-center tf-gutter tf-nav-clearance">
      {/* Flo slides in looking as surprised as the user is. An error state is
          seen rarely and is already a small frustration, so a reaction here
          costs nothing and takes the edge off. */}
      <Mascot {...MOMENTS.error} size={104} className="text-primary" />
      <p className="font-mono text-[13px] font-bold uppercase tracking-[0.2em] text-muted">
        404
      </p>
      <h1 className="font-heading text-xl font-bold tracking-tight text-foreground-strong">
        Page not found
      </h1>
      <p className="max-w-[32ch] text-sm leading-relaxed text-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className={buttonClasses({ size: 'lg', className: 'mt-4 px-8' })}>
        Back to home
      </Link>
    </section>
  );
}

export default NotFoundPage;
