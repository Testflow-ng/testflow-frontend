import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { buttonClasses } from '../ui/index.js';

/**
 * Landing hero. Text-first on mobile, two-column on desktop. Real photography,
 * flat brand color, pill CTAs, no gradients.
 */
function HomeHero({ stats, isAuthenticated }) {
  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-14 pt-10 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pb-24 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground-strong">
            Now covering ECO102 and PHY102
          </span>

          <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground-strong sm:text-5xl lg:text-6xl">
            Pass your exams with real practice
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            TestFlow is the CBT practice platform for OAU students. Sit timed mock exams, get
            instant corrections, and track your progress until you are ready.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className={buttonClasses({
                  size: 'lg',
                  className: 'w-full gap-2 sm:w-auto',
                })}
              >
                Go to dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className={buttonClasses({
                    size: 'lg',
                    className: 'w-full gap-2 sm:w-auto',
                  })}
                >
                  Get started free
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className={buttonClasses({
                    variant: 'outline',
                    size: 'lg',
                    className: 'w-full sm:w-auto',
                  })}
                >
                  Sign in
                </Link>
              </>
            )}
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm text-muted">
            <CheckCircle2 size={16} className="text-success" />
            Free to start
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <img
            src="/photos/hero-student.webp"
            alt="A student practicing on a laptop"
            className="aspect-[4/5] w-full rounded-3xl border border-border object-cover sm:aspect-[4/3] lg:aspect-[4/5]"
          />

          <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl border border-border bg-surface/95 px-4 py-3 shadow-lg backdrop-blur">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground-strong">
                {(stats?.totalExams ?? 500).toLocaleString()}+ tests
              </p>
              <p className="text-xs text-muted">completed this term</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HomeHero;
