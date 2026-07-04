import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  Smartphone,
  Clock,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { buttonClasses } from '../components/ui/index.js';
import { useAuth } from '../features/auth/useAuth.js';
import { cn } from '../utils/cn.js';

function HomePage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Clock,
      title: 'Timed Simulations',
      description: 'Practice under real exam conditions with customizable timers and auto-submission.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get your score and detailed corrections the moment you hit submit.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      icon: BarChart3,
      title: 'Deep Analytics',
      description: 'Track your performance trends across subjects and identify your weak spots.',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      icon: ShieldCheck,
      title: 'Secure & Fair',
      description: 'Randomized questions and option shuffling ensure every attempt is unique.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    }
  ];

  const steps = [
    { title: 'Choose Subject', desc: 'Select from a wide range of academic courses.' },
    { title: 'Configure Exam', desc: 'Pick your question count and set your time limit.' },
    { title: 'Take Test', desc: 'Focus on the distraction-free examination interface.' },
    { title: 'Review & Improve', desc: 'Analyze your mistakes with detailed explanations.' }
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-5 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary mb-6">
                <SparklesIcon className="w-4 h-4" />
                <span>Now with ECO102 & PHY102</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground-strong sm:text-6xl lg:text-5xl xl:text-6xl text-balance">
                Master your exams with <span className="text-primary">confidence.</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted max-w-xl">
                TestFlow is the premium CBT platform designed to help you ace your university courses through rigorous, timed simulations and intelligent analytics.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className={buttonClasses({ size: 'lg', className: 'w-full gap-2 sm:w-auto h-14 px-8 text-base shadow-lg shadow-primary/20' })}
                  >
                    Go to Dashboard
                    <ArrowRight size={20} />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className={buttonClasses({ size: 'lg', className: 'w-full gap-2 sm:w-auto h-14 px-8 text-base shadow-lg shadow-primary/20' })}
                    >
                      Get Started Free
                      <ArrowRight size={20} />
                    </Link>
                    <Link
                      to="/login"
                      className={buttonClasses({ variant: 'outline', size: 'lg', className: 'w-full sm:w-auto h-14 px-8 text-base' })}
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-10 flex items-center gap-4 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <p className="font-medium text-foreground-strong">Trusted by students</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-16 lg:col-span-6 lg:mt-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full max-w-lg"
            >
              <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50 animate-pulse" />
              <figure className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
                <img
                  src="/illustrations/illustration-dashboard-hero.webp"
                  alt="TestFlow Interface"
                  className="w-full h-auto"
                />
              </figure>
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-surface p-4 rounded-xl border border-border shadow-xl flex items-center gap-3 animate-bounce-slow">
                <div className="bg-green-500 rounded-full p-1">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground-strong">Score: 95%</p>
                  <p className="text-[10px] text-muted">Exams Completed</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-surface py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-primary uppercase tracking-widest">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground-strong sm:text-4xl">
              Built for high-performance students
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground-strong">
                    <div className={cn("h-10 w-10 flex items-center justify-center rounded-lg", feature.bg)}>
                      <feature.icon className={cn("h-6 w-6", feature.color)} aria-hidden="true" />
                    </div>
                    {feature.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-background py-24 sm:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground-strong sm:text-4xl mb-8">
                Ready to start? <br />It's as simple as 1, 2, 3...
              </h2>
              <div className="space-y-8">
                {steps.map((step, i) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex-none flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground-strong">{step.title}</h3>
                      <p className="text-muted text-sm mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                 <Link
                    to="/register"
                    className={buttonClasses({ size: 'lg', className: 'gap-2' })}
                  >
                    Start practicing now
                    <ArrowRight size={18} />
                  </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl p-8">
                <div className="w-full h-full border border-border bg-surface rounded-2xl shadow-xl flex items-center justify-center">
                   <Smartphone className="w-24 h-24 text-primary opacity-20" />
                   <p className="absolute text-center font-heading text-lg text-muted px-12">
                     Focused mobile interface for maximum concentration
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="relative isolate overflow-hidden bg-primary-dark px-6 py-24 text-center shadow-2xl rounded-3xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Don't leave your grades to chance.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
              Join hundreds of students using TestFlow to prepare for their exams. Start your first simulation today.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-md bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-sm hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Create your account
              </Link>
            </div>
            <svg
              viewBox="0 0 1024 1024"
              className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
              aria-hidden="true"
            >
              <circle cx={512} cy={512} r={512} fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)" fillOpacity="0.7" />
              <defs>
                <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                  <stop stopColor="#FFF" />
                  <stop offset={1} stopColor="#FFF" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-xl font-bold text-foreground-strong">TestFlow</span>
              <p className="text-sm text-muted mt-2 text-center md:text-left">
                Empowering students with world-class <br className="hidden md:block" /> examination technology.
              </p>
            </div>
            <div className="flex gap-8">
              <Link to="/features" className="text-sm text-muted hover:text-primary transition-colors">How it works</Link>
              <Link to="/login" className="text-sm text-muted hover:text-primary transition-colors">Sign In</Link>
              <Link to="/register" className="text-sm text-muted hover:text-primary transition-colors">Register</Link>
            </div>
            <div className="text-sm text-muted">
              &copy; {new Date().getFullYear()} Eddyrus Media. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SparklesIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

export default HomePage;
