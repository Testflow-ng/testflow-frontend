import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, Sparkles, ListChecks } from 'lucide-react';
import { buttonClasses } from '../components/ui/index.js';
import { useAuth } from '../features/auth/useAuth.js';

const FEATURES = [
  {
    Icon: Clock,
    title: 'Timed papers',
    copy: 'A steady countdown with autosave, so a lost signal never costs you an answer.',
  },
  {
    Icon: ListChecks,
    title: 'Your own flow',
    copy: 'Jump between questions, mark ones for review, and track your progress as you go.',
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

function FeaturesPage() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="mx-auto w-full max-w-xl flex-1 px-5 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-foreground-strong">How TestFlow works</h1>
      <p className="mt-2 text-muted">Everything you need for a focused exam, and nothing you don&apos;t.</p>

      <ul className="mt-8 flex flex-col gap-6">
        {FEATURES.map(({ Icon, title, copy }) => (
          <li key={title} className="flex gap-4">
            <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground-strong">{title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{copy}</p>
            </div>
          </li>
        ))}
      </ul>

      {!isAuthenticated && (
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link to="/register" className={buttonClasses({ className: 'w-full sm:w-auto' })}>
            Create an account
          </Link>
          <Link
            to="/login"
            className={buttonClasses({ variant: 'outline', className: 'w-full sm:w-auto' })}
          >
            Sign in
          </Link>
        </div>
      )}
    </section>
  );
}

export default FeaturesPage;
