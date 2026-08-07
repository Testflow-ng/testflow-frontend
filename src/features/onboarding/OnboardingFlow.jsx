import { useCallback, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '../../components/ui/index.js';
import WhatsAppIcon from '../../components/icons/WhatsAppIcon.jsx';
import { WHATSAPP_CHANNEL_URL, WHATSAPP_GREEN } from '../../constants/social.js';
import { cn } from '../../utils/cn.js';

/*
  Three screens, not four.

  The old flow had four, and two of them sold features that do not exist yet
  (Live CBT and AI study). Promising an unbuilt feature in the first thirty
  seconds is the fastest way to lose trust later, so both are gone. What is
  left is what the app actually does today, plus one ask at the end.

  Every screen is skippable and the choice is remembered. Nothing here blocks
  a student from reaching a paper.
*/

const EASE_OUT = [0.23, 1, 0.32, 1];

/** Unsplash serves these at the exact width we render, so a phone on a metered
 *  connection is not downloading a 2000px hero. */
const photo = (id, w = 900) => `https://images.unsplash.com/${id}?w=${w}&q=75&auto=format&fit=crop`;

const STEPS = [
  {
    key: 'practise',
    image: photo('photo-1571260899304-425eee4c7efc'),
    // Alt describes the photo for someone who cannot see it, and does not
    // repeat the heading sitting directly beneath it.
    alt: 'A student working through past questions at a desk',
    eyebrow: 'Past questions',
    title: 'Sit the real thing, before the real thing.',
    body: 'Practise your courses under a timer, with the question and option order shuffled every attempt, so you are learning the material and not the answer sheet.',
  },
  {
    key: 'progress',
    image: photo('photo-1522202176988-66273c2fd55f'),
    alt: 'Students comparing notes together on campus',
    eyebrow: 'Your standing',
    title: 'Know which paper to open next.',
    body: 'Every attempt updates one readiness score and names your weakest subject. No guessing about what to revise on the night before.',
  },
  {
    key: 'follow',
    // The Eddyrus Media cover already in the app, reused rather than a second
    // asset to download and keep in sync.
    image: '/photos/cover-default.png',
    alt: 'Eddyrus Media',
    eyebrow: 'Stay in the loop',
    title: 'Follow Eddyrus Media.',
    body: 'New question banks, exam timetables and updates land on the WhatsApp channel first.',
    isFollow: true,
  },
];

function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const finish = useCallback(() => {
    localStorage.setItem('tf_onboarded', '1');
    onComplete();
  }, [onComplete]);

  const next = useCallback(() => {
    if (isLast) return finish();
    setDirection(1);
    setStep((s) => s + 1);
  }, [isLast, finish]);

  const back = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  }, []);

  // Slide distance collapses to zero under reduced motion; the crossfade stays,
  // because it is what tells you the screen changed at all.
  const travel = reduceMotion ? 0 : 40;

  return (
    <div className="fixed inset-0 z-[600] flex flex-col bg-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* Skip stays reachable on every screen, including the last. */}
        <div
          className="flex items-center justify-between px-4"
          style={{ paddingTop: 'calc(0.75rem + var(--safe-top))' }}
        >
          <div className="flex items-center gap-1.5" role="presentation">
            {STEPS.map((s, i) => (
              <span
                key={s.key}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-[var(--duration-md)] ease-[var(--ease-out)]',
                  i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border-strong',
                )}
              />
            ))}
            <span className="sr-only">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
          <button
            type="button"
            onClick={finish}
            className="tf-pressable -mr-2 flex min-h-11 items-center rounded-full px-2 text-[15px] font-semibold text-muted active:text-foreground-strong"
          >
            Skip
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={current.key}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? travel : -travel }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -travel : travel }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="flex h-full flex-col px-4 pt-5"
            >
              <div className="overflow-hidden rounded-[1.5rem] border border-border bg-surface-strong">
                <img
                  src={current.image}
                  alt={current.alt}
                  width={900}
                  height={600}
                  // The first screen's image is the LCP element, so it must not
                  // be lazy. The later two are prefetched by the browser once
                  // this component mounts anyway.
                  loading={step === 0 ? 'eager' : 'lazy'}
                  fetchPriority={step === 0 ? 'high' : 'auto'}
                  className={cn(
                    'w-full object-cover',
                    // The Eddyrus cover is a logo lockup, not a photograph, so
                    // it gets a shorter frame and is not cropped as hard.
                    current.isFollow ? 'aspect-[16/10] object-contain p-2' : 'aspect-[4/3]',
                  )}
                />
              </div>

              <div className="mt-6">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                  {current.eyebrow}
                </p>
                <h2 className="mt-2 font-heading text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground-strong">
                  {current.title}
                </h2>
                <p className="mt-3 max-w-[42ch] text-[15px] leading-relaxed text-muted">
                  {current.body}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Actions dock to the bottom, clear of the home indicator. */}
        <div
          className="flex flex-col gap-2 px-4 pt-4"
          style={{ paddingBottom: 'calc(1rem + var(--safe-bottom))' }}
        >
          {current.isFollow && (
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noreferrer"
              className="tf-pressable flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full text-[15px] font-bold text-white"
              style={{ backgroundColor: WHATSAPP_GREEN }}
            >
              <WhatsAppIcon size={18} />
              Follow on WhatsApp
            </a>
          )}

          <Button
            size="lg"
            fullWidth
            onClick={next}
            variant={current.isFollow ? 'outline' : 'primary'}
            trailingIcon={
              isLast ? <Check size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />
            }
          >
            {isLast ? 'Start practising' : 'Next'}
          </Button>

          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="tf-pressable mx-auto flex min-h-11 items-center rounded-full px-4 text-[14px] font-semibold text-muted active:text-foreground-strong"
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingFlow;
