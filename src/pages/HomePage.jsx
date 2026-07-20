import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Clock,
  Zap,
  BarChart3,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { publicApi } from '../api/public.js';
import { buttonClasses } from '../components/ui/index.js';
import { useAuth } from '../features/auth/useAuth.js';
import { cn } from '../utils/cn.js';
import HomeHero from '../components/landing/HomeHero.jsx';
import LandingFooter from '../components/landing/LandingFooter.jsx';
import Reveal from '../components/landing/Reveal.jsx';

const FEATURES = [
  {
    icon: Clock,
    title: 'Real exam timing',
    description:
      'Practice under exact exam conditions with a live timer and automatic submission when time runs out.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Zap,
    title: 'Instant marking',
    description:
      'See your score and full corrections the moment you submit, with explanations for every question.',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    icon: BarChart3,
    title: 'Progress analytics',
    description:
      'Track your scores across subjects over time and find the exact topics that need more work.',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    icon: ShieldCheck,
    title: 'Fair every time',
    description:
      'Questions and options are shuffled on every attempt, so each practice run is genuinely new.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
  },
];

const SUBJECTS = [
  { code: 'MTH101', title: 'Elementary Mathematics I', color: 'bg-blue-500' },
  { code: 'CSC101', title: 'Introduction to Computer Science', color: 'bg-green-500' },
  { code: 'PHY101', title: 'General Physics I', color: 'bg-purple-500' },
  { code: 'CHM101', title: 'General Chemistry I', color: 'bg-amber-500' },
  { code: 'ECO101', title: 'Principles of Economics I', color: 'bg-rose-500' },
  { code: 'GNS101', title: 'Use of English I', color: 'bg-indigo-500' },
];

const STEPS = [
  {
    title: 'Pick a subject',
    desc: 'Choose from your course combination and set how many questions you want.',
  },
  {
    title: 'Set your timer',
    desc: 'Practice at exam pace or take your time. You decide the clock.',
  },
  {
    title: 'Sit the test',
    desc: 'A clean, distraction-free screen that works well even on a small phone.',
  },
  {
    title: 'Review and improve',
    desc: 'Read the explanation behind every answer and watch your scores climb.',
  },
];

function HomePage() {
  const { isAuthenticated } = useAuth();
  const { data: stats } = useQuery({
    queryKey: ['publicStats'],
    queryFn: publicApi.getStats,
    staleTime: 60 * 60 * 1000,
  });

  return (
    <div className="flex w-full flex-col">
      <HomeHero stats={stats} isAuthenticated={isAuthenticated} />

      <TrustBar stats={stats} />

      <SubjectsSection stats={stats} />

      <FeaturesSection />

      <HowItWorksSection isAuthenticated={isAuthenticated} />

      <ResultsBand stats={stats} />

      <FinalCta stats={stats} isAuthenticated={isAuthenticated} />

      <LandingFooter />
    </div>
  );
}

function TrustBar({ stats }) {
  const items = [
    { value: `${(stats?.totalQuestions ?? 1500).toLocaleString()}+`, label: 'Practice questions' },
    { value: `${(stats?.totalStudents ?? 1300).toLocaleString()}+`, label: 'Students' },
    { value: `${(stats?.totalExams ?? 500).toLocaleString()}+`, label: 'Tests taken' },
    { value: `${stats?.totalSubjects ?? 50}+`, label: 'Subjects' },
  ];

  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-5 py-10 sm:grid-cols-4 sm:px-8">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <p className="font-heading text-3xl font-extrabold text-foreground-strong">
              {item.value}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SubjectsSection({ stats }) {
  return (
    <section id="subjects" className="scroll-mt-24 bg-background py-16 sm:py-24">
      <Reveal className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-8 flex flex-col gap-2">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground-strong sm:text-4xl">
            Built for your hardest courses
          </h2>
          <p className="max-w-2xl text-muted">
            Full question banks for the first-year courses students struggle
            with most, with new subjects added every semester.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => (
            <div
              key={s.code}
              className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/40"
            >
              <div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-white',
                  s.color,
                )}
              >
                {s.code.substring(0, 3)}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                  {s.code}
                </p>
                <h3 className="truncate font-semibold text-foreground-strong">
                  {s.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            See all {stats?.totalSubjects ?? 50}+ subjects
            <ArrowRight size={16} />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="border-y border-border bg-surface py-16 sm:py-24">
      <Reveal className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground-strong sm:text-4xl">
            Everything you need to prepare
          </h2>
          <p className="mt-3 text-muted">
            No fluff. Just the tools that actually move your grade.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-background p-6"
            >
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl',
                  feature.bg,
                )}
              >
                <feature.icon className={cn('h-5 w-5', feature.color)} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground-strong">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function HowItWorksSection({ isAuthenticated }) {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-background py-16 sm:py-24">
      <Reveal className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">
            How it works
          </p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-foreground-strong sm:text-4xl">
            From first tap to full score
          </h2>

          <ol className="mt-8 space-y-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-extrabold text-primary-foreground">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold text-foreground-strong">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {step.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className={buttonClasses({
              size: 'lg',
              className: 'mt-8 w-full gap-2 sm:w-auto',
            })}
          >
            {isAuthenticated ? 'Go to dashboard' : 'Start practicing'}
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="order-1 lg:order-2">
          <img
            src="/photos/study-notes.webp"
            alt="A student taking notes while studying"
            loading="lazy"
            className="aspect-[4/5] w-full rounded-3xl border border-border object-cover"
          />
        </div>
      </Reveal>
    </section>
  );
}

function ResultsBand({ stats }) {
  return (
    <section className="border-y border-border bg-surface py-16 sm:py-24">
      <Reveal className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <img
          src="/photos/graduate.webp"
          alt="A graduate celebrating"
          loading="lazy"
          className="aspect-[4/3] w-full rounded-3xl border border-border object-cover"
        />
        <div>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground-strong sm:text-4xl">
            Walk into the exam hall ready
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            TestFlow was built by OAU students for OAU students. Every question
            mirrors the real thing, so nothing on your paper feels unfamiliar.
          </p>
          <div className="mt-6 flex items-center gap-1 text-warning">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} className="fill-warning" />
            ))}
            <span className="ml-2 text-sm font-semibold text-foreground-strong">
              Trusted by {(stats?.totalStudents ?? 1300).toLocaleString()}+ students
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function FinalCta({ stats, isAuthenticated }) {
  return (
    <section className="bg-background py-16 sm:py-24">
      <Reveal className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="rounded-3xl bg-primary px-6 py-14 text-center sm:px-12 sm:py-20">
          <h2 className="mx-auto max-w-2xl font-heading text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
            Your next exam starts with one practice test
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-primary-foreground/80">
            Join {(stats?.totalStudents ?? 1300).toLocaleString()}+ students
            already preparing with TestFlow. Setting up your first test takes
            under a minute.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-background px-8 text-base font-semibold text-primary transition-transform active:scale-95 sm:w-auto"
            >
              {isAuthenticated ? 'Go to dashboard' : 'Create free account'}
              <ArrowRight size={18} />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-primary-foreground/30 px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 sm:w-auto"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default HomePage;
