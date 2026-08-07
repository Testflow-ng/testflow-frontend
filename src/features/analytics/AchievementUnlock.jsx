import { Modal, Button } from '../../components/ui/index.js';
import Mascot from '../../components/brand/Mascot.jsx';
import Confetti from '../../components/brand/Confetti.jsx';

/**
 * Badge unlock celebration.
 *
 * Shown on the result screen, after the score, when an attempt has earned a
 * new badge. Placed there rather than on the dashboard because that is the
 * moment it was earned: a badge announced two screens later has lost its
 * cause.
 *
 * It waits for the score. The result is the thing the student came for, and a
 * celebration that lands on top of it would bury the number.
 *
 * Multiple badges from one paper are listed in a single sheet rather than
 * queued as separate dialogs — three modals in a row is a chore, not a reward.
 */
function AchievementUnlock({ achievements, open, onClose }) {
  if (!achievements?.length) return null;

  const many = achievements.length > 1;

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={many ? `${achievements.length} new badges` : 'New badge'}
      description={
        many ? 'That paper earned you a few.' : 'That paper earned you something.'
      }
      footer={
        <Button size="lg" onClick={onClose}>
          Nice
        </Button>
      }
    >
      <div className="relative overflow-hidden py-1">
        <Confetti active={open} />

        <Mascot
          mood="applauding"
          animation="bounce"
          size={104}
          className="relative mx-auto text-score-good"
        />

        <ul className="relative mt-4 flex flex-col gap-2">
          {achievements.map((a) => (
            <li
              key={a.key}
              className="rounded-2xl border border-success/25 bg-success/5 px-4 py-3 text-center"
            >
              <p className="text-[15px] font-bold text-foreground-strong">{a.label}</p>
              <p className="mt-0.5 text-[13px] text-muted">{a.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

export default AchievementUnlock;
