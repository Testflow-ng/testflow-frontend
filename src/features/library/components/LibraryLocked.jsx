import { Link } from 'react-router-dom';
import { BookOpen, Check } from 'lucide-react';
import { Button, Card } from '../../../components/ui/index.js';
import Mascot from '../../../components/brand/Mascot.jsx';

const POINTS = ['Read every book in the app', 'Download books to study offline', 'No ads, and host Live CBT too'];

/** Shown instead of the reader when the student has no pass. Free students can still browse the shelf. */
function LibraryLocked({ onBack }) {
  return (
    <Card padding="lg" className="mx-auto flex max-w-[34rem] flex-col items-center gap-5 bg-[var(--brand-lavender)] text-center">
      <Mascot mood="encouraging" animation="float" size={96} />
      <div>
        <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground-strong">Reading is part of the Student Pass</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground">You can browse the whole shelf for free. A pass lets you open and download the books.</p>
      </div>
      <ul className="space-y-2 text-left text-sm text-foreground">
        {POINTS.map((p) => (
          <li key={p} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-surface text-primary"><Check size={12} strokeWidth={2.5} aria-hidden="true" /></span>
            {p}
          </li>
        ))}
      </ul>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <Link to="/billing"><Button size="lg" className="w-full" leadingIcon={<BookOpen size={16} />}>Get a Student Pass</Button></Link>
        {onBack && <Button variant="ghost" size="lg" onClick={onBack}>Back to the shelf</Button>}
      </div>
    </Card>
  );
}

export default LibraryLocked;
