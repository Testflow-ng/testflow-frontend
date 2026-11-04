import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, FileQuestion, Plus, Radio, Timer } from 'lucide-react';
import { Badge, Banner, Button, EmptyState, Field, Input, Modal, Reveal, SkeletonCard, StatusBadge, useToast } from '../../../components/ui/index.js';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { ICON } from '../../../components/ui/iconProps.js';
import { cn } from '../../../utils/cn.js';
import { formatMoney } from '../../../utils/money.js';
import { wsApi } from '../api.js';
import { usePlanFeatures } from '../usePlanFeatures.js';
import { useExams, useWsMutation } from '../useWorkspace.js';

const MODES = [
  { value: 'anytime', icon: Timer, title: 'Anytime', text: 'Students take it whenever they like.' },
  { value: 'live', icon: Radio, title: 'Live CBT', text: 'Everyone starts together at a time you set.' },
];

/** Your exams. Each card opens the exam, where you add questions, set the rules and see the results. */
function ExamsScreen() {
  const navigate = useNavigate();
  const { data, isLoading } = useExams();
  const [creating, setCreating] = useState(false);
  const { maxExams } = usePlanFeatures();
  const atLimit = maxExams != null && (data?.length ?? 0) >= maxExams;
  const newExam = () => setCreating(true);

  return (
    <Screen width="full">
      <PageHeader title="Exams" subtitle="Create an exam, add questions, share the link, then see how your students did." action={<><Link to="/workspace/banks"><Button size="sm" variant="outline">Question banks</Button></Link><Button size="sm" disabled={atLimit} onClick={newExam} leadingIcon={<Plus size={15} />}>New exam</Button></>} />
      {maxExams != null && !isLoading && <Banner variant={atLimit ? 'warning' : 'info'} className="mt-6" action={<Link to="/workspace/billing"><Button size="sm" variant="secondary">See Pro</Button></Link>}>{atLimit ? `You have used all ${maxExams} exams on the Free plan. Upgrade to Pro to make as many as you like.` : `Free plan: ${data?.length ?? 0} of ${maxExams} exams used.`}</Banner>}
      <div className="mt-8">
        {isLoading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><SkeletonCard className="h-44" /><SkeletonCard className="h-44" /></div> : !data?.length ? (
          <EmptyState mood="encouraging" title="Create your first exam" description="You will add the questions next, then share a link with your students." action={<Button onClick={() => setCreating(true)}>New exam</Button>} />
        ) : (
          <Reveal>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => navigate(`/workspace/exams/${e.id}`)} className="tf-pressable block h-full w-full rounded-[24px] border border-border bg-surface p-5 text-left transition-colors hover:border-border-strong hover:bg-surface-strong/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-heading text-lg font-bold leading-snug text-foreground-strong">{e.title}</h2>
                      <StatusBadge status={e.status === 'published' ? 'published' : 'draft'} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant={e.mode === 'live' ? 'lavender' : 'outline'}>{e.mode === 'live' ? 'Live CBT' : 'Anytime'}</Badge>
                      {e.priceMinor ? <Badge variant="lime">{formatMoney(e.priceMinor)}</Badge> : <Badge variant="outline">Free</Badge>}
                    </div>
                    <p className="mt-5 flex items-center gap-4 text-sm text-muted">
                      <span className="inline-flex items-center gap-1.5"><FileQuestion {...ICON} size={15} />{e.questionCount ?? 0} questions</span>
                      <span className="inline-flex items-center gap-1.5"><Clock {...ICON} size={15} />{e.durationMinutes} min</span>
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
      <NewExam open={creating} onOpenChange={setCreating} onCreated={(id) => navigate(`/workspace/exams/${id}`)} />
    </Screen>
  );
}

function NewExam({ open, onOpenChange, onCreated }) {
  const toast = useToast();
  const { canLive } = usePlanFeatures();
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState('anytime');
  const create = useWsMutation((id, body) => wsApi.saveExam(id, body), {
    onSuccess: (exam) => { toast.success('Exam created', 'Now add your questions.'); setTitle(''); onOpenChange(false); onCreated(exam.id); },
    onError: (e) => toast.error('Could not create', e.message),
  });
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New exam" description="You can change all of this later."
      footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button loading={create.isPending} disabled={title.trim().length < 2} onClick={() => create.mutate({ title: title.trim(), mode, durationMinutes: 45, priceMinor: 0, access: 'link', showCorrections: 'now' })}>Create exam</Button></>}>
      <div className="space-y-5 py-1">
        <Field label="Name of the exam"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mathematics mock" maxLength={120} autoFocus /></Field>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-foreground-strong">How will students take it?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {MODES.map(({ value, icon: Icon, title: t, text }) => {
              const locked = value === 'live' && !canLive;
              return (
                <label key={value} className={cn('flex flex-col gap-1.5 rounded-2xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-primary', locked ? 'cursor-not-allowed border-border bg-surface-strong/40 opacity-80' : 'cursor-pointer', !locked && (mode === value ? 'border-primary bg-[var(--brand-lavender)]/60' : 'border-border hover:bg-surface-strong/50'))}>
                  <input type="radio" name="mode" value={value} checked={mode === value} disabled={locked} onChange={() => setMode(value)} className="sr-only" />
                  <span className="flex items-center gap-2 font-semibold text-foreground-strong"><Icon {...ICON} size={18} className="text-primary" />{t}{locked && <Badge variant="lime" className="ml-auto">Studio</Badge>}</span>
                  <span className="text-sm text-muted">{locked ? 'Everyone starts together. Part of the Studio plan.' : text}</span>
                  {locked && <Link to="/workspace/billing" className="text-sm font-semibold text-primary hover:underline">See Studio</Link>}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
    </Modal>
  );
}

export default ExamsScreen;
