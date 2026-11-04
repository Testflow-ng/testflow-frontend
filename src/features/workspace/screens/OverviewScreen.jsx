import { Link } from 'react-router-dom';
import { ArrowRight, Check, Circle, FileQuestion, Share2, Users, Wallet } from 'lucide-react';
import { ListChecks } from 'lucide-react';
import { Card, ProgressBar, Reveal } from '../../../components/ui/index.js';
import StatCard from '../../../components/data/StatCard.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { formatMoney } from '../../../utils/money.js';
import { useOrg } from '../OrgContext.js';
import { useDomains, useEarnings, useExams, useSite, useStudents } from '../useWorkspace.js';

function OverviewScreen() {
  const { org } = useOrg();
  const site = useSite().data;
  const exams = useExams().data ?? [];
  const students = useStudents({ limit: 1 }).data;
  const earnings = useEarnings().data;
  const domains = useDomains().data ?? [];

  const steps = [
    { done: Boolean(site?.brand?.logoUrl), label: 'Add your name and logo', to: '/workspace/domains' },
    { done: exams.length > 0, label: 'Create your first exam', to: '/workspace/exams' },
    { done: (students?.total ?? 0) > 0, label: 'Invite your students', to: '/workspace/students' },
    { done: org.payout?.status === 'active', label: 'Add your payout account', to: '/workspace/payments' },
    { done: domains.some((d) => d.type === 'custom' && d.status === 'active') || domains.length > 0, label: 'Choose your web address', to: '/workspace/domains' },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <Screen width="full">
      <PageHeader title={`Welcome, ${org.name}`} subtitle="Build your CBT, set your prices and see how it is doing." />
      <div className="mt-8 space-y-8">
        <Reveal>
          <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: FileQuestion, title: '1. Create an exam', text: 'Give it a name. Anytime, or a Live CBT on Studio.', to: '/workspace/exams' },
              { icon: Check, title: '2. Add questions', text: 'Type them, import a file, or add pictures.', to: '/workspace/exams' },
              { icon: Share2, title: '3. Make it live and share', text: 'Send the link. Free, or charge a fee.', to: '/workspace/exams' },
              { icon: Users, title: '4. See the results', text: 'Scores for every student, in one place.', to: '/workspace/students' },
            ].map(({ icon: Icon, title, text, to }) => (
              <li key={title}><Link to={to} className="tf-pressable flex h-full gap-3 rounded-[20px] border border-border bg-surface p-4 hover:bg-surface-strong/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-lavender)] text-primary"><Icon size={18} strokeWidth={1.5} aria-hidden="true" /></span><span><span className="block font-semibold text-foreground-strong">{title}</span><span className="block text-sm text-muted">{text}</span></span></Link></li>
            ))}
          </ol>
        </Reveal>
        <Reveal delay={0.04}>
          <Card padding="lg" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground-strong">Get set up</h2>
              <p className="mt-1 text-sm text-muted">{doneCount} of {steps.length} done</p>
              <ProgressBar className="mt-4" value={doneCount} max={steps.length} tone="accent" />
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {steps.map((s) => (
                <li key={s.label}>
                  <Link to={s.to} className="flex items-center gap-3 rounded-2xl border border-border p-3 text-sm hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <span className={`flex size-6 shrink-0 items-center justify-center rounded-full ${s.done ? 'bg-success text-white' : 'border border-border-strong text-muted'}`}>{s.done ? <Check size={14} aria-hidden="true" /> : <Circle size={10} aria-hidden="true" />}</span>
                    <span className={s.done ? 'text-muted line-through' : 'font-medium text-foreground-strong'}>{s.label}</span>
                    {!s.done && <ArrowRight size={14} className="ml-auto text-muted" aria-hidden="true" />}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Students" value={students?.total ?? 0} icon={Users} tone="primary" />
            <StatCard label="Exams" value={exams.length} icon={ListChecks} tone="sage" />
            <StatCard label="Your earnings, 30 days" value={formatMoney(earnings?.totals?.last30d ?? 0)} icon={Wallet} tone="accent" />
          </div>
        </Reveal>
      </div>
    </Screen>
  );
}

export default OverviewScreen;
