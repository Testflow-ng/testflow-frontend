import { useState } from 'react';
import { Button, SegmentedControl, useToast } from '../../../components/ui/index.js';
import TemplatePicker from '../../../components/everybody/TemplatePicker.jsx';
import BlockList from '../../../components/everybody/BlockList.jsx';
import BlockEditor from '../../../components/everybody/BlockEditor.jsx';
import DevicePreview from '../../../components/everybody/DevicePreview.jsx';
import PublishBar from '../../../components/everybody/PublishBar.jsx';
import VersionHistory from '../../../components/everybody/VersionHistory.jsx';
import ColorPicker from '../../../components/everybody/ColorPicker.jsx';
import { SiteRenderer } from '../../../components/everybody/SiteBlocks.jsx';
import QuestionEditor from '../../../components/everybody/QuestionEditor.jsx';
import ExamSettingsForm from '../../../components/everybody/ExamSettingsForm.jsx';
import BulkImport from '../../../components/everybody/BulkImport.jsx';
import InviteDialog from '../../../components/everybody/InviteDialog.jsx';
import GroupManager from '../../../components/everybody/GroupManager.jsx';
import PostCard from '../../../components/everybody/PostCard.jsx';
import PostComposer from '../../../components/everybody/PostComposer.jsx';
import CommentThread from '../../../components/everybody/CommentThread.jsx';
import DomainCard from '../../../components/everybody/DomainCard.jsx';
import SubscriptionSummary from '../../../components/everybody/SubscriptionSummary.jsx';
import InvoiceTable from '../../../components/everybody/InvoiceTable.jsx';
import PlanChangeDialog from '../../../components/everybody/PlanChangeDialog.jsx';
import PaymentReturnStatus from '../../../components/everybody/PaymentReturnStatus.jsx';
import PlanLock from '../../../components/everybody/PlanLock.jsx';
import { emptyQuestion, examInit, people, siteBlocks, siteTemplates } from './samples.js';

const CAT = 'Everyone';

export default [
  {
    id: 'site-builder', name: 'Site builder', category: CAT, source: ['everybody/TemplatePicker.jsx', 'everybody/BlockList.jsx', 'everybody/BlockEditor.jsx', 'everybody/PublishBar.jsx', 'everybody/VersionHistory.jsx'],
    description: 'Pick a template, reorder blocks with the keyboard, edit one, publish and roll back.',
    keywords: ['website', 'builder', 'template', 'blocks', 'publish', 'version', 'cms', 'organisation'],
    Preview: function Demo() {
      const toast = useToast();
      const [tpl, setTpl] = useState('modern');
      const [blocks, setBlocks] = useState(siteBlocks);
      const [sel, setSel] = useState('b1');
      return (
        <div className="grid gap-5">
          <TemplatePicker templates={siteTemplates} value={tpl} onValueChange={setTpl} />
          <PublishBar hasUnpublished publishedAt="12 Oct, 4:10 pm" version={3} onPublish={() => toast.success('Published')} onPreview={() => {}} />
          <div className="grid items-start gap-5 md:grid-cols-2">
            <BlockList blocks={blocks} selectedId={sel} onSelect={setSel}
              onMove={(id, d) => setBlocks((bs) => { const i = bs.findIndex((b) => b.id === id); const j = i + d; if (j < 0 || j >= bs.length) return bs; const n = [...bs]; [n[i], n[j]] = [n[j], n[i]]; return n; })}
              onRemove={(id) => setBlocks((bs) => bs.filter((b) => b.id !== id))}
              onAdd={(type) => setBlocks((bs) => [...bs, { id: `n${bs.length + 1}${type}`, type, title: '', text: '', items: [] }])} />
            <BlockEditor block={blocks.find((b) => b.id === sel)} onChange={(nb) => setBlocks((bs) => bs.map((b) => (b.id === nb.id ? nb : b)))} />
          </div>
          <VersionHistory currentVersion={3} versions={[{ version: 3, publishedAt: '12 Oct, 4:10 pm', by: 'Feranmi' }, { version: 2, publishedAt: '8 Oct, 9:02 am', by: 'Feranmi' }]} onRollback={(v) => toast.success(`Rolled back to v${v.version}`)} />
        </div>
      );
    },
    usage: `import TemplatePicker from '../components/everybody/TemplatePicker.jsx';
import BlockList from '../components/everybody/BlockList.jsx';
import BlockEditor from '../components/everybody/BlockEditor.jsx';

<TemplatePicker templates={templates} value={template} onValueChange={setTemplate} />
<BlockList blocks={blocks} selectedId={id} onSelect={setId} onMove={move} onRemove={remove} onAdd={add} />
<BlockEditor block={selectedBlock} onChange={update} />`,
  },
  {
    id: 'site-preview', name: 'Device preview and site renderer', category: CAT, source: ['everybody/DevicePreview.jsx', 'everybody/SiteBlocks.jsx'],
    description: 'Render an organisation site inside a desktop, tablet or phone frame.',
    keywords: ['preview', 'device', 'responsive', 'site', 'render', 'tenant', 'public'],
    Preview: () => (
      <DevicePreview>
        <SiteRenderer
          config={{ brand: { name: 'Advance Tutorials', primaryColor: '#163a5f', accentColor: '#f5c542' }, nav: [{ label: 'Exams', href: '#' }, { label: 'Contact', href: '#' }], sections: siteBlocks, footer: { text: '© Advance Tutorials', links: [{ label: 'Privacy', href: '#' }] } }}
          data={{ exams: [{ id: 'e1', title: 'Mathematics mock', meta: '40 questions · 45 min' }, { id: 'e2', title: 'Use of English', meta: '60 questions · 40 min' }] }}
        />
      </DevicePreview>
    ),
    usage: `import DevicePreview from '../components/everybody/DevicePreview.jsx';
import { SiteRenderer } from '../components/everybody/SiteBlocks.jsx';

<DevicePreview>
  <SiteRenderer config={{ brand, nav, sections, footer }} data={{ exams }} />
</DevicePreview>`,
  },
  {
    id: 'color-picker', name: 'Colour picker', category: CAT, source: 'everybody/ColorPicker.jsx',
    description: 'Pick a brand colour with a contrast check, so unreadable choices are flagged.',
    keywords: ['colour', 'color', 'brand', 'theme', 'contrast', 'accessibility', 'hex'],
    Preview: function Demo() {
      const [c, setC] = useState('#163a5f');
      return <div className="max-w-sm"><ColorPicker label="Primary colour" value={c} onChange={setC} /></div>;
    },
    usage: `import ColorPicker from '../components/everybody/ColorPicker.jsx';

<ColorPicker label="Primary colour" value={brand.primaryColor} onChange={(c) => setBrand({ ...brand, primaryColor: c })} />`,
  },
  {
    id: 'exam-authoring', name: 'Exam authoring', category: CAT, source: ['everybody/QuestionEditor.jsx', 'everybody/ExamSettingsForm.jsx', 'everybody/BulkImport.jsx'],
    description: 'Write a question with live LaTeX, set exam rules, and bulk-import up to 500 rows.',
    keywords: ['question editor', 'latex', 'settings', 'import', 'csv', 'authoring', 'exam'],
    Preview: function Demo() {
      const toast = useToast();
      const [qn, setQn] = useState(emptyQuestion);
      const [exam, setExam] = useState(examInit);
      return (
        <div className="grid gap-6">
          <QuestionEditor value={qn} onChange={setQn} />
          <ExamSettingsForm value={exam} onChange={setExam} />
          <BulkImport columns={[{ key: 'stem', header: 'Question' }, { key: 'topic', header: 'Topic' }]} onImport={async (rows) => toast.success(`Imported ${rows.length} questions`)} />
        </div>
      );
    },
    usage: `import QuestionEditor from '../components/everybody/QuestionEditor.jsx';
import ExamSettingsForm from '../components/everybody/ExamSettingsForm.jsx';
import BulkImport from '../components/everybody/BulkImport.jsx';

<QuestionEditor value={question} onChange={setQuestion} />
<ExamSettingsForm value={settings} onChange={setSettings} />
<BulkImport columns={[{ key: 'stem', header: 'Question' }]} onImport={async (rows) => save(rows)} />`,
  },
  {
    id: 'people-community', name: 'People, groups and community', category: CAT, source: ['everybody/InviteDialog.jsx', 'everybody/GroupManager.jsx', 'everybody/PostCard.jsx', 'everybody/PostComposer.jsx', 'everybody/CommentThread.jsx'],
    description: 'Invite people, manage groups, and the announcement feed with comments.',
    keywords: ['invite', 'students', 'groups', 'roles', 'post', 'announcement', 'comments', 'community'],
    Preview: function Demo() {
      const toast = useToast();
      const [invite, setInvite] = useState(false);
      const [groups, setGroups] = useState([{ id: 'g1', name: 'SS3 Science', memberIds: ['s1', 's2'] }]);
      const [comments, setComments] = useState([{ id: 'c1', author: 'Tunde Bello', time: '2h ago', text: 'Thanks for sharing this!', canDelete: true }]);
      return (
        <div className="grid gap-5">
          <div><Button onClick={() => setInvite(true)}>Invite people…</Button></div>
          <InviteDialog open={invite} onOpenChange={setInvite} onInvite={async (p) => toast.success(`Invited ${p.emails?.length ?? 0} (${p.role})`)} />
          <GroupManager groups={groups} people={people} onCreate={(n) => setGroups((g) => [...g, { id: `g${g.length + 1}`, name: n, memberIds: [] }])} onRename={(id, n) => setGroups((g) => g.map((x) => (x.id === id ? { ...x, name: n } : x)))} onDelete={(id) => setGroups((g) => g.filter((x) => x.id !== id))} onMembersChange={(id, ids) => setGroups((g) => g.map((x) => (x.id === id ? { ...x, memberIds: ids } : x)))} />
          <div className="grid max-w-xl gap-3">
            <PostComposer canAnnounce onSubmit={async () => toast.success('Posted')} />
            <PostCard moderation={{}} post={{ id: 'p1', type: 'announcement', author: 'Mrs Adeyemi', time: 'Today, 9:00', text: 'Mock exams open on Monday. Please read the instructions first.', pinned: true, commentCount: 1 }} />
            <CommentThread comments={comments} onAdd={(t) => setComments((c) => [...c, { id: `c${c.length + 1}`, author: 'You', time: 'now', text: t, canDelete: true }])} onDelete={(id) => setComments((c) => c.filter((x) => x.id !== id))} />
          </div>
        </div>
      );
    },
    usage: `import InviteDialog from '../components/everybody/InviteDialog.jsx';
import GroupManager from '../components/everybody/GroupManager.jsx';
import PostCard from '../components/everybody/PostCard.jsx';

<InviteDialog open={open} onOpenChange={setOpen} onInvite={async ({ emails, role }) => invite(emails, role)} />
<GroupManager groups={groups} people={people} onCreate={create} onRename={rename} onDelete={remove} onMembersChange={setMembers} />
<PostCard post={post} moderation={{}} />`,
  },
  {
    id: 'billing', name: 'Domains and billing', category: CAT, source: ['everybody/DomainCard.jsx', 'everybody/SubscriptionSummary.jsx', 'everybody/InvoiceTable.jsx', 'everybody/PlanChangeDialog.jsx', 'everybody/PaymentReturnStatus.jsx'],
    description: 'Custom-domain steps with copyable DNS records, subscription, invoices, plan change and the payment return page.',
    keywords: ['domain', 'dns', 'subscription', 'invoice', 'payment', 'plan', 'billing', 'paystack'],
    Preview: function Demo() {
      const toast = useToast();
      const [domainStatus, setDomainStatus] = useState('pending');
      const [planOpen, setPlanOpen] = useState(false);
      const [ret, setRet] = useState('verifying');
      return (
        <div className="grid gap-5">
          <DomainCard domain={{ hostname: 'advance.testflow.com.ng', type: 'subdomain', status: 'active', isPrimary: true }} />
          <DomainCard onVerify={() => setDomainStatus((s) => (s === 'pending' ? 'failed' : 'active'))} domain={{ hostname: 'exams.advance.ng', type: 'custom', status: domainStatus, records: [{ type: 'CNAME', host: 'exams.advance.ng', value: 'cname.testflow.com.ng' }, { type: 'TXT', host: '_testflow-verify.exams.advance.ng', value: 'tf-verify=7c1f93aa02' }], expiresAt: 'in 7 days' }} />
          <SubscriptionSummary onChangePlan={() => setPlanOpen(true)} onCancel={() => {}} subscription={{ planName: 'Pro', status: 'active', priceMinor: 700000, currency: 'NGN', interval: 'month', currentPeriodEnd: '12 Nov 2026', adsEnabled: true }} />
          <PlanChangeDialog open={planOpen} onOpenChange={setPlanOpen} currentKey="pro" plans={[{ key: 'pro', name: 'Pro', priceMinor: 700000, currency: 'NGN', interval: 'month', adsEnabled: true }, { key: 'studio', name: 'Studio', priceMinor: 2000000, currency: 'NGN', interval: 'month', adsEnabled: false }]} onConfirm={async () => toast.success('Plan change scheduled')} />
          <InvoiceTable payments={[{ id: 'i1', reference: 'SUB-20481', planName: 'Pro', kind: 'renewal', amountKobo: 700000, currency: 'NGN', status: 'paid', paidAt: '2026-10-12' }, { id: 'i2', reference: 'SUB-19002', planName: 'Pro', kind: 'new', amountKobo: 700000, currency: 'NGN', status: 'paid', paidAt: '2026-09-12' }]} />
          <div className="space-y-3">
            <SegmentedControl label="Return state" size="sm" value={ret} onValueChange={setRet} options={['verifying', 'paid', 'pending', 'failed'].map((v) => ({ value: v, label: v }))} />
            <PaymentReturnStatus state={ret} details={[{ label: 'Reference', value: 'SUB-20481' }, { label: 'Amount', value: '₦7,000' }]} continueTo="/" onRetry={() => {}} onCheckAgain={() => {}} />
          </div>
        </div>
      );
    },
    usage: `import DomainCard from '../components/everybody/DomainCard.jsx';
import SubscriptionSummary from '../components/everybody/SubscriptionSummary.jsx';
import PaymentReturnStatus from '../components/everybody/PaymentReturnStatus.jsx';

<DomainCard domain={{ hostname, type: 'custom', status, records }} onVerify={verify} />
<SubscriptionSummary subscription={subscription} onChangePlan={openPlans} onCancel={cancel} />
<PaymentReturnStatus state="verifying" details={[{ label: 'Reference', value: ref }]} continueTo="/" />`,
  },
  {
    id: 'plan-lock', name: 'Plan lock', category: CAT, source: ['everybody/PlanLock.jsx'],
    description: 'Shows a feature the plan does not include: an upgrade card on top and the real screen dimmed underneath, so people can see what they would get.',
    Preview: () => (
      <PlanLock plan="Pro" title="Announcements are part of Pro" description="Upgrade to post notices on your students' home page.">
        <div className="rounded-[24px] border border-border bg-surface p-5 text-sm text-muted">The locked screen shows here.</div>
      </PlanLock>
    ),
    usage: `import PlanLock from '../components/everybody/PlanLock.jsx';

<PlanLock locked={!canAnnounce} plan="Pro" title="Announcements are part of Pro" description="...">
  <ScreenContent />
</PlanLock>`,
  },
];
