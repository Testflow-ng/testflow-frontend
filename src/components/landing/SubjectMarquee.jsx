import { cn } from '../../utils/cn.js';
import LogoLoop from './LogoLoop.jsx';
import Reveal from './Reveal.jsx';

const SUBJECTS = [
  { code: 'MTH101', title: 'Elementary Mathematics I', color: 'bg-blue-500' },
  { code: 'CSC101', title: 'Intro to Computer Science', color: 'bg-green-500' },
  { code: 'PHY101', title: 'General Physics I', color: 'bg-purple-500' },
  { code: 'CHM101', title: 'General Chemistry I', color: 'bg-amber-500' },
  { code: 'ECO101', title: 'Principles of Economics I', color: 'bg-rose-500' },
  { code: 'GNS101', title: 'Use of English I', color: 'bg-indigo-500' },
  { code: 'MTH102', title: 'Elementary Mathematics II', color: 'bg-sky-500' },
  { code: 'PHY102', title: 'General Physics II', color: 'bg-fuchsia-500' },
  { code: 'ECO102', title: 'Principles of Economics II', color: 'bg-teal-500' },
  { code: 'BIO101', title: 'General Biology I', color: 'bg-emerald-500' },
  { code: 'STA101', title: 'Intro to Statistics', color: 'bg-orange-500' },
  { code: 'ACC101', title: 'Intro to Accounting', color: 'bg-cyan-500' },
];

function SubjectChip({ code, title, color }) {
  return (
    <span className="flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2.5 text-sm">
      <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', color)} />
      <span className="font-bold text-foreground-strong">{code}</span>
      <span className="whitespace-nowrap text-muted">{title}</span>
    </span>
  );
}

function toLogos(list) {
  return list.map((s) => ({
    node: <SubjectChip {...s} />,
    title: s.code,
    ariaLabel: `${s.code} ${s.title}`,
  }));
}

const ROW_ONE = toLogos(SUBJECTS.slice(0, 6));
const ROW_TWO = toLogos(SUBJECTS.slice(6));

function SubjectMarquee() {
  return (
    <section
      id="subjects"
      className="scroll-mt-24 border-y border-border bg-background py-16 sm:py-24"
    >
      <Reveal className="mx-auto mb-10 max-w-6xl px-5 sm:px-8">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          Every subject, one app
        </p>
        <h2 className="mt-3 max-w-2xl font-heading text-3xl font-extrabold tracking-tight text-foreground-strong sm:text-4xl">
          Practice the exact courses on your timetable
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Full question banks across the first-year courses students struggle
          with most, with new subjects added every semester.
        </p>
      </Reveal>

      <div className="flex flex-col gap-4">
        <LogoLoop
          logos={ROW_ONE}
          direction="left"
          speed={40}
          gap={16}
          logoHeight={20}
          hoverSpeed={0}
          fadeOut
          fadeOutColor="var(--background)"
          ariaLabel="Subjects available on TestFlow"
        />
        <LogoLoop
          logos={ROW_TWO}
          direction="right"
          speed={40}
          gap={16}
          logoHeight={20}
          hoverSpeed={0}
          fadeOut
          fadeOutColor="var(--background)"
          ariaLabel="More subjects available on TestFlow"
        />
      </div>
    </section>
  );
}

export default SubjectMarquee;
