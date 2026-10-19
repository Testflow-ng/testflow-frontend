import { Button, Modal } from '../../components/ui/index.js';
import Mascot from '../../components/brand/Mascot.jsx';

/** The one-time offer. Never forced: "Skip for now" is as easy as "Take a quick tour". */
function WelcomeModal({ open, onStart, onSkip }) {
  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onSkip()}
      size="sm"
      title="Welcome to Testflow"
      description="Practise real exam questions, track your scores and compete with friends."
      footer={
        <>
          <Button variant="ghost" onClick={onSkip}>Skip for now</Button>
          <Button onClick={onStart}>Take a quick tour</Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 py-1 text-center">
        <Mascot mood="encouraging" animation="wave" size={104} />
        <p className="max-w-[34ch] text-sm leading-relaxed text-muted">It takes about 30 seconds. You can restart it any time from Settings.</p>
      </div>
    </Modal>
  );
}

export default WelcomeModal;
