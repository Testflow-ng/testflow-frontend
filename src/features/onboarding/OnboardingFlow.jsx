import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trophy, Users, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from '../../components/ui/index.js';

const STEPS = [
  {
    Icon: BookOpen,
    title: 'Practice real CBT exams',
    body: 'Access past questions from your courses and practice under timed conditions, just like the real thing.',
  },
  {
    Icon: Users,
    title: 'Challenge your friends',
    body: 'Create live CBT sessions and compete with classmates in real time. Share a code, everyone joins.',
  },
  {
    Icon: Sparkles,
    title: 'AI-powered study help',
    body: 'Get smart revision suggestions, auto-generated quizzes, and personalized learning insights.',
  },
  {
    Icon: Trophy,
    title: 'Track your progress',
    body: 'See how you improve over time with detailed analytics, streaks, and achievement badges.',
  },
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const next = useCallback(() => {
    if (isLast) {
      localStorage.setItem('tf_onboarded', '1');
      onComplete();
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  }, [isLast, onComplete]);

  const skip = useCallback(() => {
    localStorage.setItem('tf_onboarded', '1');
    onComplete();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-6">
      <button
        type="button"
        onClick={skip}
        className="absolute right-5 top-5 text-sm font-medium text-muted hover:text-foreground transition-colors"
      >
        Skip
      </button>

      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex flex-col items-center"
          >
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <current.Icon className="h-10 w-10 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground-strong">
              {current.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {current.body}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>

        <div className="mt-8 w-full">
          <Button fullWidth onClick={next} className="h-12 text-base">
            {isLast ? (
              <>
                Get started
                <Check className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingFlow;
