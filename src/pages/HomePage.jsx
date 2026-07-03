import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { buttonClasses } from '../components/ui/index.js';
import { useAuth } from '../features/auth/useAuth.js';

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-7 px-5 py-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight text-foreground-strong sm:text-5xl">
          Sit your exams with calm and confidence.
        </h1>
        <p className="max-w-md text-lg leading-relaxed text-muted">
          A focused, distraction-free computer-based testing experience, built for your phone.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className={buttonClasses({ size: 'lg', className: 'w-full gap-2 sm:w-auto' })}
          >
            Go to your dashboard
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        ) : (
          <>
            <Link
              to="/register"
              className={buttonClasses({ size: 'lg', className: 'w-full gap-2 sm:w-auto' })}
            >
              Get started
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              to="/features"
              className={buttonClasses({ variant: 'outline', size: 'lg', className: 'w-full sm:w-auto' })}
            >
              How it works
            </Link>
          </>
        )}
      </div>

      <figure className="mt-2 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <img
          src="/illustrations/illustration-dashboard-hero.webp"
          srcSet="/illustrations/illustration-dashboard-hero-640w.webp 640w, /illustrations/illustration-dashboard-hero-1024w.webp 1024w, /illustrations/illustration-dashboard-hero.webp 1254w"
          sizes="(max-width: 640px) 100vw, 576px"
          alt="A student taking a timed exam on their phone, surrounded by subject progress, results, and achievement cards."
          width="1254"
          height="1254"
          className="h-auto w-full"
        />
      </figure>
    </section>
  );
}

export default HomePage;
