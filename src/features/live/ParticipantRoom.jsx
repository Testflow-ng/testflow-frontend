import { Ban, Hourglass, Users } from 'lucide-react';
import { Button, Card, EmptyState, KeyValueList, StatusBadge, useToast } from '../../components/ui/index.js';
import Mascot from '../../components/brand/Mascot.jsx';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { liveApi } from './api.js';
import { useLiveAction } from './useLive.js';
import LiveExamRunner from './LiveExamRunner.jsx';
import LiveResult from './LiveResult.jsx';

/** One calm card for every "nothing to do yet" state, with Flo reacting to what is true. */
function Waiting({ mood, title, text, children }) {
  return (
    <Card padding="lg" className="flex flex-col items-center gap-4 bg-[var(--brand-lavender)] text-center">
      <Mascot mood={mood} animation="float" size={112} />
      <div>
        <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground-strong">{title}</h2>
        <p className="mx-auto mt-1.5 max-w-[46ch] text-sm leading-relaxed text-foreground">{text}</p>
      </div>
      {children}
    </Card>
  );
}

function ParticipantRoom({ room, code }) {
  const toast = useToast();
  const join = useLiveAction(code, () => liveApi.join(code), { onSuccess: () => toast.success('Request sent. Wait for the host.') });
  const m = room.membership;

  if (m?.status === 'approved' && room.status === 'in_progress' && m.attemptStatus === 'in_progress') return <LiveExamRunner code={code} />;
  if (m?.status === 'approved' && room.status === 'results_published' && ['submitted', 'timed_out'].includes(m.attemptStatus)) return <LiveResult code={code} title={room.title} />;

  const details = [
    { label: 'Questions', value: room.numQuestions },
    { label: 'Time', value: `${room.durationMinutes} minutes` },
    { label: 'Difficulty', value: <span className="capitalize">{room.difficulty}</span> },
    { label: 'Negative marking', value: room.negativeMarking ? `-${room.negativeMarking} per wrong answer` : 'None' },
    { label: 'In the room', value: `${room.approvedCount} approved${room.pendingCount ? `, ${room.pendingCount} waiting` : ''}` },
  ];

  let body;
  if (room.status === 'cancelled') {
    body = <EmptyState icon={Ban} title="This session was cancelled" description="The host called it off. Ask them for a new code." action={<Button onClick={() => window.history.back()}>Go back</Button>} />;
  } else if (!m) {
    body = ['completed', 'results_published', 'in_progress'].includes(room.status) ? (
      <EmptyState icon={Ban} title="This session has already started" description="You can only join before the host starts the exam." />
    ) : (
      <Waiting mood="happy" title="Ready to join?" text="The host approves everyone before the exam. Once you are in, wait here for the start.">
        <Button size="lg" loading={join.isPending} onClick={() => join.mutate(undefined, { onError: (e) => toast.error(e?.message ?? 'Could not join.') })}>Ask to join</Button>
      </Waiting>
    );
  } else if (m.status === 'pending') {
    body = <Waiting mood="thinking" title="Waiting for the host" text="Your request is in. The host will approve you shortly. This page updates by itself." />;
  } else if (m.status === 'rejected') {
    body = <EmptyState icon={Ban} title="The host did not approve you" description="Ask them to add you, then request again with the same code." />;
  } else if (room.status === 'in_progress') {
    body = <Waiting mood="encouraging" title="Your paper is closed" text="You have submitted. Results appear here when the host publishes them." />;
  } else if (room.status === 'completed') {
    body = <Waiting mood="happy" title="Exam over" text="Waiting for the host to publish the results. This page updates by itself." />;
  } else {
    body = (
      <Waiting mood="excited" title="You are in!" text="Stay on this page. The exam starts the moment the host presses start.">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground-strong"><Users size={16} aria-hidden="true" />{room.approvedCount} approved{m.sequenceNumber ? ` · you are #${m.sequenceNumber}` : ''}</span>
      </Waiting>
    );
  }

  return (
    <Screen width="md">
      <PageHeader back="/live" eyebrow="Live CBT" title={room.title} subtitle={room.description || `Code ${room.shareCode}`} action={<StatusBadge status={room.status} />} />
      <div className="mt-6 space-y-6">
        {body}
        <section aria-labelledby="rules">
          <h2 id="rules" className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted"><Hourglass size={13} aria-hidden="true" /> The rules</h2>
          <KeyValueList items={details} />
        </section>
      </div>
    </Screen>
  );
}

export default ParticipantRoom;
