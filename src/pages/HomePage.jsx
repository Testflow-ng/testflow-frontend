import { Link } from 'react-router-dom';
import { ArrowRight, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { buttonClasses } from '../components/ui/index.js';
import { useAuth } from '../features/auth/useAuth.js';

const SUBJECTS = ['PHY102', 'ACC102', 'MTH102', 'EGL102', 'PHL102', 'CHM102', 'STA112', 'GST112'];

const HIGHLIGHTS = [
  {
    Icon: Clock,
    title: 'Timed papers',
    copy: 'A steady countdown and autosave, so a lost signal never costs you an answer.',
  },
  {
    Icon: ShieldCheck,
    title: 'Secure sessions',
    copy: 'Every attempt is protected and tied to your account from start to submission.',
  },
  {
    Icon: Sparkles,
    title: 'Instant results',
    copy: 'See your score and worked corrections the moment you submit.',
  },
];

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-10 px-5 py-12">
      <section className="flex flex-col gap-5">
        <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight text-foreground-strong sm:text-5xl">
          Sit your exams with calm and confidence.
        </h1>

        <p className="max-w-md text-lg leading-relaxed text-muted">
          TestFlow is a platform built for focused, distraction-free assessments. Clean papers,
          honest timing, and results you can trust, right from your phone.
        </p>

        <div className="mt-1 flex flex-col gap-3 sm:flex-row">
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
                to="/login"
                className={buttonClasses({
                  variant: 'outline',
                  size: 'lg',
                  className: 'w-full sm:w-auto',
                })}
              >
                I have an account
              </Link>
            </>
          )}
        </div>
      </section>

      <figure className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
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

      <section className="flex flex-col gap-4">
        <ul className="flex flex-col gap-4">
          {HIGHLIGHTS.map(({ Icon, title, copy }) => (
            <li key={title} className="flex gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-foreground-strong">{title}</h2>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">{copy}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
          Available subjects
        </p>
        <ul className="flex flex-wrap gap-2">
          {SUBJECTS.map((subject) => (
            <li
              key={subject}
              className="rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-xs text-foreground"
            >
              {subject}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default HomePage;
