import { useState } from 'react';
import { useAuth } from '../useAuth.js';
import { authApi } from '../api.js';
import { Modal, Button, Input, Alert } from '../../../components/ui/index.js';
import {
  ArrowRight,
  BookMarked,
  CheckCircle2,
  ChevronDown,
  Flame,
  Sparkles,
  Trophy,
  User as UserIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn.js';

/**
 * Expandable feature row.
 *
 * The whole row is the toggle, so it renders as a real <button> with
 * `aria-expanded` rather than a div with an onClick. Title case at 15px
 * replaced the 12px black-uppercase treatment, which was hard to read at a
 * glance on a phone and fought the sheet's own title for attention.
 */
function FeatureTile({ icon: Icon, title, description, details, colorClass, isOpen, onClick }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border transition-colors duration-[var(--duration-sm)]',
        isOpen ? 'border-primary bg-surface' : 'border-border bg-surface-strong',
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-expanded={isOpen}
        className="tf-pressable flex w-full items-center justify-between gap-3 p-3.5 text-left"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl',
              colorClass,
            )}
          >
            <Icon size={19} className="text-white" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-semibold leading-snug text-foreground-strong">
              {title}
            </span>
            <span className="mt-0.5 block text-[13px] leading-snug text-muted">{description}</span>
          </span>
        </span>
        <ChevronDown
          size={17}
          aria-hidden="true"
          className={cn(
            'shrink-0 text-muted transition-transform duration-[var(--duration-sm)] ease-[var(--transition-ease)]',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-4">
              <div className="mb-3 h-px bg-border" />
              <ul className="flex flex-col gap-2">
                {details.map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2
                      size={14}
                      className="mt-0.5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span className="text-[13px] leading-relaxed text-muted">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UsernameSetupModal({ open, onComplete }) {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState(null);

  const isAdmin = ['admin', 'super_admin'].includes(user?.role);
  const title = isAdmin ? 'Secure your admin handle' : 'The big exam upgrade';
  const description = isAdmin
    ? 'Please set a unique username for your administrative account. This ensures clear tracking in audit logs.'
    : "We've added powerful new tools to help you dominate your upcoming exams. Let's get you set up.";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const updatedUser = await authApi.setUsername(username);
      setUser(updatedUser);
      onComplete();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Something went wrong. Try another username.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      id: 'leaderboard',
      icon: Trophy,
      title: 'Hall of Fame',
      description: 'Compete with other students in your courses.',
      colorClass: 'bg-amber-500',
      details: [
        'Each subject has its own unique leaderboard.',
        'Rankings are based on score, accuracy, and speed.',
        'Privacy first: you can opt out at any time from settings.',
      ],
    },
    {
      id: 'streaks',
      icon: Flame,
      title: 'Daily streaks',
      description: 'Stay consistent and keep your fire burning.',
      colorClass: 'bg-orange-500',
      details: [
        'Practice daily to increase your streak count.',
        'Your streak fire appears on your avatar for all to see.',
        'Missing a day resets the fire, so keep your momentum.',
      ],
    },
    {
      id: 'courses',
      icon: BookMarked,
      title: 'Course organization',
      description: 'Filter and pin your specific courses.',
      colorClass: 'bg-blue-500',
      details: [
        'Star your current courses to keep them at the top.',
        'Filter by level (100L, 200L, and so on) to hide irrelevant subjects.',
        'Clean, personalized dashboard designed for exam focus.',
      ],
    },
  ];

  return (
    <Modal
      open={open}
      onOpenChange={() => {}}
      dismissible={false}
      title={
        <span className="flex items-center gap-2">
          <Sparkles size={19} className="shrink-0 text-primary" aria-hidden="true" /> {title}
        </span>
      }
      description={description}
      footer={
        <Button
          type="submit"
          form="username-setup"
          size="lg"
          loading={loading}
          trailingIcon={<ArrowRight size={18} aria-hidden="true" />}
        >
          {isAdmin ? 'Complete admin setup' : 'Start dominating exams'}
        </Button>
      }
    >
      <div className="space-y-5 py-1">
        {/* Features preview: students only */}
        {!isAdmin && (
          <section className="flex flex-col gap-2">
            <h3 className="mb-0.5 px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              What&rsquo;s new
            </h3>
            {features.map((f) => (
              <FeatureTile
                key={f.id}
                {...f}
                isOpen={expandedFeature === f.id}
                onClick={() => setExpandedFeature(expandedFeature === f.id ? null : f.id)}
              />
            ))}
          </section>
        )}

        {/*
          The form submits from the sheet footer via `form="username-setup"`,
          so the primary action stays pinned above the home indicator instead of
          scrolling away below three expandable feature cards.
        */}
        <form id="username-setup" onSubmit={handleSubmit} className="space-y-3">
          <label
            htmlFor="username-setup-input"
            className="flex items-center gap-2 text-[15px] font-semibold text-foreground-strong"
          >
            <UserIcon size={16} className="text-primary" aria-hidden="true" />
            {isAdmin ? 'Admin handle' : 'Secure your username'}
          </label>
          {!isAdmin && (
            <p className="text-[13px] leading-relaxed text-muted">
              This is how you will appear on the{' '}
              <span className="font-semibold text-primary">Hall of Fame</span>. Pick something cool.
            </p>
          )}
          <Input
            id="username-setup-input"
            placeholder={isAdmin ? 'e.g. Admin_Jane' : 'e.g. Scholar_King'}
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, '_'))}
            // No autoFocus: on a phone it raises the keyboard the instant the
            // sheet appears, covering the feature list the user hasn't read yet.
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            minLength={3}
            maxLength={20}
          />
          {error && <Alert variant="danger">{error}</Alert>}
        </form>
      </div>
    </Modal>
  );
}

export default UsernameSetupModal;
