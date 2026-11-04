import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, LayoutPanelTop, ShieldAlert, TrendingUp, Check, ArrowRight, Play } from 'lucide-react';
import { Button } from '../../../components/ui/index.js';

const STEPS = [
  {
    Icon: LayoutPanelTop,
    title: 'The Multi-Subject CBT',
    body: 'OAU Mock tests include 4 subjects: General Knowledge + 3 electives. You can switch between them at any time.',
  },
  {
    Icon: Calculator,
    title: 'Integrated Calculator',
    body: 'No need for external tools. Use our scientific calculator directly inside the exam environment.',
  },
  {
    Icon: ShieldAlert,
    title: 'Strict Integrity Mode',
    body: 'To simulate the real proctored exam, switching tabs 3 times will automatically submit your attempt.',
  },
  {
    Icon: TrendingUp,
    title: 'Admission Aggregate',
    body: 'We auto-calculate your final score based on JAMB, O-Level, and Post-UTME results to predict your admission chances.',
  },
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
};

function PostUtmeWelcomeFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const next = useCallback(() => {
    if (isLast) {
      localStorage.setItem('tf_utme_welcomed', '1');
      onComplete();
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  }, [isLast, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md px-6">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <div className="mb-10 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
          <Play size={12} className="fill-current" />
          Post-UTME Activation
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'backOut' }}
            className="flex flex-col items-center"
          >
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-surface border border-border shadow-2xl shadow-primary/10">
              <current.Icon className="h-10 w-10 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">
              {current.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {current.body}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex items-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === step ? 'w-8 bg-primary shadow-lg shadow-primary/30' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>

        <div className="mt-10 w-full space-y-3">
          <Button fullWidth onClick={next} className="h-14 text-base rounded-2xl shadow-xl shadow-primary/20">
            {isLast ? (
              <>
                Enter the Vault
                <Check className="ml-2 h-5 w-5" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PostUtmeWelcomeFlow;
