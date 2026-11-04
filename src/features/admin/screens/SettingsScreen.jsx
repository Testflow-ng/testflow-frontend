import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, Database, RefreshCw, Trash2 } from 'lucide-react';
import { Button, Card, Field, Input, KeyValueList, Skeleton, StickyActionBar, Switch, useToast } from '../../../components/ui/index.js';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { adminApi } from '../api.js';
import { useAdminMutation, useAdminSettings, useRetentionOverview } from '../useAdmin.js';
import { LoadError } from './shared.jsx';

/** Platform settings. Edits stay local until you press Save. */
function SettingsScreen() {
  const { data, isLoading, error } = useAdminSettings();
  if (error) return <Screen width="lg"><LoadError error={error} what="settings" /></Screen>;
  if (isLoading || !data) return <Screen width="lg"><Skeleton className="mt-8 h-80 w-full rounded-[20px]" /></Screen>;
  return <Form key={data.updatedAt ?? 'settings'} settings={data} />;
}

function Form({ settings }) {
  const toast = useToast();
  const [f, setF] = useState(settings);
  const dirty = JSON.stringify(f) !== JSON.stringify(settings);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const save = useAdminMutation(adminApi.updateSettings, { onSuccess: () => toast.success('Settings saved'), onError: (e) => toast.error('Could not save', e.message) });

  return (
    <Screen width="lg">
      <PageHeader title="Settings" subtitle="Platform-wide options." />
      <div className="mt-8 space-y-6 pb-24">
        <Card padding="lg" className="space-y-5">
          <div><h2 className="font-heading text-base font-bold text-foreground-strong">Post-UTME</h2><p className="text-sm text-muted">Access and how students pay for it.</p></div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4"><div><p className="text-sm font-semibold text-foreground-strong">Post-UTME is open</p><p className="text-xs text-muted">Turn off to pause access for everyone.</p></div><Switch checked={Boolean(f.isPostUtmeActive)} onCheckedChange={(v) => set('isPostUtmeActive', v)} aria-label="Post-UTME is open" /></div>
          <Field label="Price (₦)"><Input type="number" min="0" value={f.postUtmePrice ?? 0} onChange={(e) => set('postUtmePrice', Number(e.target.value))} /></Field>
        </Card>
        <Card padding="lg" className="space-y-5">
          <div><h2 className="font-heading text-base font-bold text-foreground-strong">Payment account</h2><p className="text-sm text-muted">Where students send transfers. Shown to them at checkout.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bank"><Input value={f.paymentBankName ?? ''} onChange={(e) => set('paymentBankName', e.target.value)} /></Field>
            <Field label="Account number"><Input inputMode="numeric" value={f.paymentAccountNumber ?? ''} onChange={(e) => set('paymentAccountNumber', e.target.value)} /></Field>
          </div>
          <Field label="Account name"><Input value={f.paymentAccountName ?? ''} onChange={(e) => set('paymentAccountName', e.target.value)} /></Field>
        </Card>

        <DataRetentionCard />
      </div>
      <StickyActionBar dirty={dirty} onDiscard={() => setF(settings)} onSave={() => save.mutate({ isPostUtmeActive: f.isPostUtmeActive, postUtmePrice: f.postUtmePrice, paymentBankName: f.paymentBankName, paymentAccountNumber: f.paymentAccountNumber, paymentAccountName: f.paymentAccountName })} />
    </Screen>
  );
}

function DataRetentionCard() {
  const toast = useToast();
  const qc = useQueryClient();
  const { data, isLoading, error } = useRetentionOverview();

  const sweep = useAdminMutation(adminApi.triggerRetentionSweep, {
    onSuccess: (res) => {
      toast.success(
        `Sweep done: ${res.studentPurchasesAbandoned} checkouts marked abandoned, ${res.examSessionsAbandoned} exams abandoned, ${res.examSessionsPurged} purged.`
      );
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (err) => toast.error('Sweep failed', err.message),
  });

  if (error) return <LoadError error={error} what="data retention" />;
  if (isLoading || !data) return <Skeleton className="h-48 w-full rounded-[20px]" />;

  const m = data.metrics || {};
  const last = data.lastSweep;

  return (
    <Card padding="lg" className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Database size={18} className="text-primary" />
            <h2 className="font-heading text-base font-bold text-foreground-strong">
              Data Retention & Lifecycle
            </h2>
          </div>
          <p className="text-sm text-muted">
            Automated database cleanup of abandoned checkout attempts, expired sessions, and telemetry logs.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          loading={sweep.isPending}
          onClick={() => sweep.mutate()}
          leadingIcon={<RefreshCw size={14} />}
        >
          Run Sweep Now
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface-subtle p-3 text-center">
          <span className="text-xs text-muted block">Student Checkouts</span>
          <span className="font-heading text-lg font-bold text-foreground-strong">
            {m.studentPurchases?.total ?? 0}
          </span>
          <span className="text-[11px] text-muted block mt-0.5">
            {m.studentPurchases?.abandoned ?? 0} abandoned / timed out
          </span>
        </div>
        <div className="rounded-xl border border-border bg-surface-subtle p-3 text-center">
          <span className="text-xs text-muted block">Exam Sessions</span>
          <span className="font-heading text-lg font-bold text-foreground-strong">
            {m.examSessions?.total ?? 0}
          </span>
          <span className="text-[11px] text-muted block mt-0.5">
            {m.examSessions?.inProgress ?? 0} active in-progress
          </span>
        </div>
        <div className="rounded-xl border border-border bg-surface-subtle p-3 text-center">
          <span className="text-xs text-muted block">Job Execution Logs</span>
          <span className="font-heading text-lg font-bold text-foreground-strong">
            {m.jobRuns ?? 0}
          </span>
          <span className="text-[11px] text-muted block mt-0.5">
            Auto-pruned &gt; 30 days
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border p-4 space-y-2 text-xs text-muted">
        <div className="flex items-center gap-1.5 font-semibold text-foreground-strong">
          <Clock size={14} className="text-primary" />
          Active Retention Policies
        </div>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Pending Checkouts:</strong> Timed out after 15 minutes, permanently purged after 30 days.</li>
          <li><strong>Abandoned Exam Sessions:</strong> Auto-closed after 24 hours of expiry, purged after 30 days.</li>
          <li><strong>Rate Limit Hits &amp; Expired OTPs:</strong> Cleaned up every 24 hours.</li>
          <li><strong>Inactive Push Tokens:</strong> Cleaned up after 90 days of inactivity.</li>
        </ul>
        {last && (
          <p className="pt-2 text-[11px] text-muted border-t border-border mt-2">
            Last automated sweep: {new Date(last.completedAt || last.startedAt).toLocaleString()}
          </p>
        )}
      </div>
    </Card>
  );
}

export default SettingsScreen;
