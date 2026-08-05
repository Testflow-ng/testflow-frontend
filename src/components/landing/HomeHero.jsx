import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { buttonClasses } from '../ui/index.js';

function HomeHero({ stats, isAuthenticated }) {
  const studentCount = (stats?.totalStudents ?? 1300).toLocaleString();
  const questionCount = (stats?.totalQuestions ?? 1500).toLocaleString();

  return (
    <section className="relative min-h-svh overflow-hidden bg-background">
      <div className="mx-auto flex min-h-[calc(100svh-82px)] max-w-6xl px-5 sm:px-8">
        <div className="grid flex-1 grid-cols-1 items-center gap-0 lg:grid-cols-12 lg:gap-8">
          {/* Left column -- text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="col-span-1 py-10 lg:col-span-7 lg:py-0"
          >
            <p className="text-sm font-bold uppercase tracking-widest text-primary">
              CBT practice for OAU
            </p>

            <h1 className="mt-4 font-heading text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-[1.05] tracking-tight text-foreground-strong">
              The exam hall
              <br className="hidden sm:block" />
              {' '}should feel familiar
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              {questionCount}+ real past questions, timed exactly like your CBT.
              Practice, see your corrections, and know where to focus before the
              real thing.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
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
                    Start practicing free
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

            <p className="mt-6 text-xs text-muted">
              Joined by {studentCount}+ students this semester
            </p>
          </motion.div>

          {/* Right column -- photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative col-span-1 lg:col-span-5 lg:self-stretch"
          >
            <img
              src="/photos/hero-student.webp"
              alt="A student practicing on a laptop"
              className="aspect-[3/4] w-full rounded-3xl object-cover sm:aspect-[4/3] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full lg:rounded-none lg:rounded-tl-3xl"
            />

            {/* Floating stat card */}
            <div className="absolute bottom-6 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/10 bg-background/80 px-5 py-4 backdrop-blur-md sm:left-6 sm:right-6">
              <div>
                <p className="text-2xl font-extrabold text-foreground-strong">
                  {(stats?.totalExams ?? 500).toLocaleString()}+
                </p>
                <p className="text-xs text-muted">tests completed</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-2xl font-extrabold text-foreground-strong">
                  {stats?.totalSubjects ?? 50}+
                </p>
                <p className="text-xs text-muted">course subjects</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-2xl font-extrabold text-primary">98%</p>
                <p className="text-xs text-muted">pass rate</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HomeHero;
