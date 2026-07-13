import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../api/public.js';
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  Smartphone,
  Clock,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Users,
  Award,
  BookMarked
} from 'lucide-react';
import { motion } from 'framer-motion';
import { buttonClasses } from '../components/ui/index.js';
import { useAuth } from '../features/auth/useAuth.js';
import { cn } from '../utils/cn.js';

function HomePage() {
  const { isAuthenticated } = useAuth();
  const { data: stats } = useQuery({
    queryKey: ['publicStats'],
    queryFn: publicApi.getStats,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

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

  const subjects = [
    { code: 'MTH101', title: 'Elementary Mathematics I', color: 'bg-blue-500' },
    { code: 'CSC101', title: 'Introduction to Computer Science', color: 'bg-green-500' },
    { code: 'PHY101', title: 'General Physics I', color: 'bg-purple-500' },
    { code: 'CHM101', title: 'General Chemistry I', color: 'bg-amber-500' },
    { code: 'ECO101', title: 'Principles of Economics I', color: 'bg-rose-500' },
    { code: 'GNS101', title: 'Use of English I', color: 'bg-indigo-500' }
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
                <Sparkles className="w-4 h-4" />
                <span>Now with ECO102 & PHY102 Content</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground-strong sm:text-6xl lg:text-5xl xl:text-6xl text-balance leading-[1.1]">
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

              <div className="mt-12 grid grid-cols-3 gap-8 border-t border-border pt-8">
                <div>
                  <p className="text-2xl font-black text-foreground-strong">
                    {stats?.totalQuestions?.toLocaleString() || '1,500'}+
                  </p>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Questions</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground-strong">
                    {stats?.totalStudents?.toLocaleString() || '1,300'}+
                  </p>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Active Users</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground-strong">
                    {stats?.totalExams?.toLocaleString() || '500'}+
                  </p>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Tests Taken</p>
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

              {/* Floating Badge 1 */}
              <div className="absolute -bottom-6 -left-6 bg-surface p-4 rounded-xl border border-border shadow-xl flex items-center gap-3 animate-bounce-slow">
                <div className="bg-green-500 rounded-full p-1 text-white">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground-strong">
                    {stats?.totalExams?.toLocaleString() || '500'}+
                  </p>
                  <p className="text-[10px] text-muted">Completed Tests</p>
                </div>
              </div>

              {/* Floating Badge 2 */}
              <div className="absolute -top-6 -right-6 bg-surface p-4 rounded-xl border border-border shadow-xl flex items-center gap-3 animate-pulse">
                <div className="bg-amber-500 rounded-full p-1 text-white">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground-strong">Rank #1</p>
                  <p className="text-[10px] text-muted">CSC101 Leaderboard</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Subjects */}
      <section className="py-20 bg-surface-strong">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-3">Popular Subjects</h2>
              <p className="text-3xl font-black text-foreground-strong tracking-tight">Practice for your hardest courses.</p>
            </div>
            <Link to="/register" className="text-sm font-bold text-primary flex items-center gap-2 hover:underline group">
              View all {stats?.totalSubjects || '50'}+ subjects <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((s) => (
              <div key={s.code} className="p-6 rounded-2xl bg-surface border border-border flex items-center gap-4 hover:border-primary/50 transition-colors shadow-sm">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xs", s.color)}>
                  {s.code.substring(0, 3)}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">{s.code}</p>
                  <h3 className="font-bold text-foreground-strong line-clamp-1">{s.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-surface py-24 sm:py-32 border-y border-border">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-primary uppercase tracking-widest">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground-strong sm:text-4xl">
              Built for high-performance students
            </p>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col p-8 rounded-3xl bg-surface-strong border border-transparent hover:border-border transition-all hover:bg-surface">
                <div className={cn("h-12 w-12 flex items-center justify-center rounded-xl mb-6 shadow-sm", feature.bg)}>
                  <feature.icon className={cn("h-6 w-6", feature.color)} aria-hidden="true" />
                </div>
                <dt className="text-lg font-bold text-foreground-strong mb-2">
                  {feature.title}
                </dt>
                <dd className="text-sm leading-relaxed text-muted">
                  {feature.description}
                </dd>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-background py-24 sm:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-square bg-gradient-to-tr from-primary/10 to-transparent rounded-[3rem] p-12 relative">
                <div className="w-full h-full border border-border bg-surface rounded-[2rem] shadow-2xl flex flex-col items-center justify-center p-8 text-center">
                   <Smartphone className="w-20 h-20 text-primary mb-6 opacity-80" />
                   <h3 className="text-2xl font-black text-foreground-strong mb-4">Focus Mode</h3>
                   <p className="text-sm text-muted leading-relaxed">
                     Our mobile-first interface is stripped of distractions to help you maintain deep focus during your practice sessions.
                   </p>

                   <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                      <div className="p-3 rounded-xl bg-surface-strong border border-border flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-success" />
                         <span className="text-[10px] font-bold uppercase tracking-tighter">Dark Mode</span>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-strong border border-border flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-primary" />
                         <span className="text-[10px] font-bold uppercase tracking-tighter">Timer sync</span>
                      </div>
                   </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-10 -right-10 bg-primary/20 w-20 h-20 rounded-full blur-2xl" />
                <div className="absolute bottom-10 -left-10 bg-amber-500/10 w-32 h-32 rounded-full blur-3xl" />
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">The Process</h2>
              <h3 className="text-4xl font-black tracking-tight text-foreground-strong mb-10 leading-tight"> Ace your exams in <br/>four simple steps.</h3>

              <div className="space-y-10">
                {steps.map((step, i) => (
                  <div key={step.title} className="flex gap-6 relative">
                    {i !== steps.length - 1 && (
                      <div className="absolute top-12 left-6 w-px h-10 bg-border" />
                    )}
                    <div className="flex-none flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-white font-black text-lg shadow-lg shadow-primary/20">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground-strong text-lg mb-1">{step.title}</h4>
                      <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                 <Link
                    to="/register"
                    className={buttonClasses({ size: 'lg', className: 'h-14 px-10 gap-2 shadow-xl shadow-primary/20' })}
                  >
                    Start Practicing Now
                    <ArrowRight size={20} />
                  </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-background py-16 sm:py-24 border-t border-border">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="relative isolate overflow-hidden bg-primary px-6 py-24 text-center shadow-2xl rounded-[3rem] sm:px-16 border-4 border-white/10">
            <h2 className="mx-auto max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">
              Don't leave your <br className="sm:hidden" /> grades to chance.
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/80 font-medium">
              Join {stats?.totalStudents?.toLocaleString() || '1,300'}+ students already using TestFlow to prepare for their exams. Your first simulation takes less than 60 seconds to set up.
            </p>
            <div className="mt-12 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-2xl bg-white px-10 py-4 text-base font-black text-primary shadow-xl hover:bg-surface-strong transition-all hover:scale-105 active:scale-95"
              >
                Create Account Free
              </Link>
            </div>

            {/* Background elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                   <Zap size={18} className="text-white fill-white" />
                </div>
                <span className="text-xl font-black text-foreground-strong tracking-tighter">TestFlow</span>
              </div>
              <p className="text-sm text-muted leading-relaxed max-w-sm mb-6 text-center md:text-left">
                TestFlow is the ultimate examination companion for OAU students, providing high-fidelity CBT simulations and data-driven insights to guarantee academic success.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-12">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-foreground-strong mb-6">Platform</h4>
                <ul className="space-y-4">
                  <li><Link to="/features" className="text-sm text-muted hover:text-primary transition-colors">Features</Link></li>
                  <li><Link to="/register" className="text-sm text-muted hover:text-primary transition-colors">Get Started</Link></li>
                  <li><Link to="/login" className="text-sm text-muted hover:text-primary transition-colors">Sign In</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-foreground-strong mb-6">Support</h4>
                <ul className="space-y-4">
                  <li><Link to="#" className="text-sm text-muted hover:text-primary transition-colors">Documentation</Link></li>
                  <li><Link to="#" className="text-sm text-muted hover:text-primary transition-colors">Privacy Policy</Link></li>
                  <li><Link to="#" className="text-sm text-muted hover:text-primary transition-colors">Terms of Use</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <p className="text-xs font-bold text-muted uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Eddyrus Media. Proudly built for OAU.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
