import { useState } from 'react';
import { FileQuestion } from 'lucide-react';
import {
  Alert, Banner, Button, ConfirmDialog, CopyField, EmptyState, KeyValueList, Modal, Stepper, StatusBadge, Timeline, useToast,
} from '../../../components/ui/index.js';


import { Row } from './helpers.jsx';
import ShareDialog from '../../../components/share/ShareDialog.jsx';

export default [
  {
    id: 'toast', name: 'Toast notifications', category: 'Feedback', source: 'ui/Toast.jsx',
    description: 'Short messages that confirm or warn. Mounted once in Providers; call useToast anywhere.',
    keywords: ['notification', 'snackbar', 'message', 'success', 'error', 'warning', 'info', 'alert'],
    Preview: function Demo() {
      const toast = useToast();
      return (
        <Row>
          <Button variant="secondary" onClick={() => toast.success('Saved', 'Your changes are live.')}>Success</Button>
          <Button variant="danger" onClick={() => toast.error('Could not submit', 'Check your connection and try again.')}>Error</Button>
          <Button variant="outline" onClick={() => toast.warning('Almost out of time', 'Five minutes left.')}>Warning</Button>
          <Button variant="outline" onClick={() => toast.info('New course added', 'GST101 is ready.')}>Info</Button>
          <Button variant="ghost" onClick={() => toast.toast({ title: 'Plain message' })}>Plain</Button>
        </Row>
      );
    },
    usage: `import { useToast } from '../components/ui/index.js';

const toast = useToast();

toast.success('Saved', 'Your changes are live.');
toast.error('Could not submit', 'Check your connection and try again.');
toast.warning('Almost out of time', 'Five minutes left.');
toast.info('New course added', 'GST101 is ready.');
toast.toast({ title: 'Plain message', duration: 3000 });
// Keep copy short. Success and info clear after about 3.5 s, warnings 5 s, errors 6 s.`,
  },
  {
    id: 'alert', name: 'Alert', category: 'Feedback', source: 'ui/Alert.jsx',
    description: 'An inline message inside a page or form.',
    keywords: ['message', 'notice', 'error', 'warning', 'success', 'info', 'inline'],
    controls: [
      { key: 'variant', label: 'Variant', type: 'select', options: ['info', 'success', 'warning', 'danger'], default: 'info' },
      { key: 'text', label: 'Message', type: 'text', default: 'Heads up: your session ends in 5 minutes.' },
    ],
    Preview: ({ variant, text }) => <Alert variant={variant}>{text}</Alert>,
    usage: (v) => `import { Alert } from '../components/ui/index.js';

// variant: info | success | warning | danger
<Alert variant="${v.variant}">${v.text}</Alert>`,
  },
  {
    id: 'banner', name: 'Banner', category: 'Feedback', source: 'ui/Banner.jsx',
    description: 'A wider notice with a title, an action and an optional dismiss.',
    keywords: ['announcement', 'notice', 'subscription', 'expired', 'dismiss', 'top'],
    controls: [
      { key: 'variant', label: 'Variant', type: 'select', options: ['info', 'success', 'warning', 'danger'], default: 'warning' },
      { key: 'title', label: 'Title', type: 'text', default: 'Subscription expired.' },
      { key: 'text', label: 'Message', type: 'text', default: 'Your workspace is read-only until you renew.' },
      { key: 'action', label: 'Show action', type: 'switch', default: true },
      { key: 'dismissible', label: 'Dismissible', type: 'switch', default: false },
    ],
    Preview: ({ variant, title, text, action, dismissible }) => (
      <Banner variant={variant} title={title} action={action ? <Button size="sm" variant="secondary">Renew</Button> : undefined} onDismiss={dismissible ? () => {} : undefined}>{text}</Banner>
    ),
    usage: (v) => `import { Banner, Button } from '../components/ui/index.js';

<Banner variant="${v.variant}" title="${v.title}"${v.action ? `
  action={<Button size="sm" variant="secondary">Renew</Button>}` : ''}${v.dismissible ? `
  onDismiss={() => setHidden(true)}` : ''}>
  ${v.text}
</Banner>`,
  },
  {
    id: 'modal', name: 'Modal', category: 'Feedback', source: 'ui/Modal.jsx',
    description: 'A dialog on desktop and a bottom sheet on phones.',
    keywords: ['dialog', 'popup', 'sheet', 'overlay', 'window'],
    Preview: function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open modal</Button>
          <Modal open={open} onOpenChange={setOpen} title="Submit paper?" description="You have 3 unanswered questions."
            footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Keep going</Button><Button onClick={() => setOpen(false)}>Submit</Button></>}>
            <p className="text-sm text-muted">You cannot change anything after submitting.</p>
          </Modal>
        </>
      );
    },
    usage: `import { Modal, Button } from '../components/ui/index.js';

// size: sm | md | lg    dismissible={false} stops a click outside from closing it
<Modal
  open={open}
  onOpenChange={setOpen}
  title="Submit paper?"
  description="You have 3 unanswered questions."
  footer={<Button onClick={submit}>Submit</Button>}
>
  <p>You cannot change anything after submitting.</p>
</Modal>`,
  },
  {
    id: 'confirm', name: 'Confirm dialog', category: 'Feedback', source: 'ui/ConfirmDialog.jsx',
    description: 'Ask before a risky action, optionally requiring a written reason.',
    keywords: ['delete', 'confirm', 'are you sure', 'reason', 'reject', 'sign out', 'danger'],
    Preview: function Demo() {
      const toast = useToast();
      const [a, setA] = useState(false);
      const [b, setB] = useState(false);
      return (
        <Row>
          <Button variant="danger" onClick={() => setA(true)}>Delete campaign</Button>
          <Button variant="outline" onClick={() => setB(true)}>Reject with reason</Button>
          <ConfirmDialog open={a} onOpenChange={setA} tone="danger" title="Delete this campaign?" description="This cannot be undone." confirmLabel="Delete" onConfirm={() => toast.success('Deleted (demo)')} />
          <ConfirmDialog open={b} onOpenChange={setB} tone="danger" requireReason title="Reject this ad?" description="The advertiser will see your reason." confirmLabel="Reject" onConfirm={(r) => toast.success('Rejected', r)} />
        </Row>
      );
    },
    usage: `import { ConfirmDialog } from '../components/ui/index.js';

<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  tone="danger"
  title="Reject this ad?"
  description="The advertiser will see your reason."
  confirmLabel="Reject"
  requireReason          // asks for at least 5 characters
  onConfirm={(reason) => reject(reason)}   // may return a promise; the button shows busy
/>`,
  },
  {
    id: 'share', name: 'Share dialog', category: 'Feedback', source: ['share/ShareDialog.jsx', 'share/shareTargets.js'],
    description: 'Share a public link: copy field, chat targets and the native sheet. The link is passed in, never built here.',
    keywords: ['share', 'link', 'whatsapp', 'telegram', 'x', 'twitter', 'copy', 'invite', 'og', 'preview'],
    Preview: function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Share result</Button>
          <ShareDialog
            open={open}
            onOpenChange={setOpen}
            title="Share your result"
            description="Anyone who opens this link sees your score card."
            url="https://www.testflow.com.ng/r/e5.31jrb4"
            caption="76% in GST101 on TestFlow. 38/50 correct."
          />
        </>
      );
    },
    usage: `import ShareDialog from '../components/share/ShareDialog.jsx';

// The link is always passed in: it is a URL the backend serves as a page carrying the
// Open Graph image, so it is minted server-side (a result), or a public id (a question).
<ShareDialog
  open={open}
  onOpenChange={setOpen}
  title="Share your result"
  url={share.url}        // absolute, backend-served
  caption={shareCaption} // rides along in the WhatsApp text and the native sheet
  loading={shareLoading}
  error={shareError}
/>`,
  },
  {
    id: 'empty-state', name: 'Empty state', category: 'Feedback', source: 'ui/EmptyState.jsx',
    description: 'What to show when there is nothing yet. Use Flo or an icon.',
    keywords: ['empty', 'no results', 'nothing', 'blank', 'zero state'],
    Preview: () => (
      <div className="grid gap-4 md:grid-cols-2">
        <EmptyState mood="thinking" title="No papers yet" description="Take your first practice paper and your results will show up here." action={<Button size="sm">Start a paper</Button>} />
        <EmptyState icon={FileQuestion} title="Nothing pinned" description="Pin a course and it appears in your sidebar." />
      </div>
    ),
    usage: `import { EmptyState, Button } from '../components/ui/index.js';

<EmptyState
  mood="thinking"            // or icon={FileQuestion}
  title="No papers yet"
  description="Take your first practice paper and your results will show up here."
  action={<Button>Start a paper</Button>}
/>`,
  },
  {
    id: 'status-badge', name: 'Status badge', category: 'Feedback', source: ['ui/StatusBadge.jsx', 'ui/statusMap.js'],
    description: 'One map for every status in the product, so a status always looks the same.',
    keywords: ['state', 'paid', 'active', 'pending', 'rejected', 'draft', 'label'],
    Preview: () => <Row>{['draft', 'pending_review', 'scheduled', 'active', 'rejected', 'suspended', 'paid', 'failed', 'waiting', 'in_progress', 'open', 'in_review', 'resolved', 'dismissed', 'results_published', 'verified'].map((k) => <StatusBadge key={k} status={k} />)}</Row>,
    usage: `import { StatusBadge } from '../components/ui/index.js';

// status is a key of STATUS in ui/statusMap.js. Add new statuses there.
<StatusBadge status="pending_review" />
<StatusBadge status="paid" label="Paid in full" />`,
  },
  {
    id: 'stepper', name: 'Stepper', category: 'Feedback', source: 'ui/Stepper.jsx',
    description: 'Progress through a multi-step flow.',
    keywords: ['steps', 'wizard', 'checkout', 'flow', 'progress'],
    Preview: function Demo() {
      const [step, setStep] = useState(1);
      return (
        <div className="space-y-3">
          <Stepper current={step} onStepClick={setStep} steps={[{ label: 'Create your ad', description: 'Content and image' }, { label: 'Pick days' }, { label: 'Pay' }, { label: 'Review' }]} />
          <Row><Button size="sm" variant="outline" onClick={() => setStep((n) => Math.max(0, n - 1))}>Back</Button><Button size="sm" onClick={() => setStep((n) => Math.min(3, n + 1))}>Next</Button></Row>
        </div>
      );
    },
    usage: `import { Stepper } from '../components/ui/index.js';

<Stepper
  current={step}                 // zero-based
  onStepClick={setStep}
  steps={[{ label: 'Create your ad', description: 'Content and image' }, { label: 'Pay' }]}
/>`,
  },
  {
    id: 'timeline', name: 'Timeline and key-value list', category: 'Feedback', source: ['ui/Timeline.jsx', 'ui/KeyValueList.jsx', 'ui/CopyField.jsx'],
    description: 'Event history, label/value pairs and a copyable value.',
    keywords: ['history', 'details', 'audit', 'events', 'copy', 'reference', 'summary'],
    Preview: () => (
      <div className="grid gap-4 md:grid-cols-2">
        <Timeline items={[{ title: 'Approved', time: 'Today, 10:42', tone: 'success', detail: 'Started running.' }, { title: 'Payment confirmed', time: 'Today, 10:40', tone: 'primary' }, { title: 'Submitted for review', time: 'Today, 10:38' }]} />
        <div className="space-y-4">
          <KeyValueList items={[{ label: 'Reference', value: 'AD-48213' }, { label: 'Amount', value: '₦7,000' }, { label: 'Status', value: <StatusBadge status="paid" /> }]} />
          <CopyField label="CNAME target" value="cname.testflow.com.ng" />
        </div>
      </div>
    ),
    usage: `import { Timeline, KeyValueList, CopyField } from '../components/ui/index.js';

<Timeline items={[{ title: 'Approved', time: 'Today, 10:42', tone: 'success', detail: 'Started running.' }]} />
<KeyValueList items={[{ label: 'Reference', value: 'AD-48213' }]} />
<CopyField label="CNAME target" value="cname.testflow.com.ng" />`,
  },
];
