import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, Clock, Database, GraduationCap, Layers, Percent, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { Badge, Button, Card, Field, Input, KeyValueList, Skeleton, StickyActionBar, Switch, useToast } from '../../../components/ui/index.js';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { formatMoney } from '../../../utils/money.js';
import { adminApi } from '../api.js';
import { useAdminMutation, useAdminSettings, useRetentionOverview } from '../useAdmin.js';
import { LoadError } from './shared.jsx';

const DEFAULT_STUDENT_PLANS = [
  { key: 'pass_30d', name: 'Plus', durationDays: 30, priceMinor: 50000, available: true, comingSoon: false, description: '30 days of ad-free study, Live CBT, early AI access, and custom CBT creation.' },
  { key: 'pass_90d', name: 'Pro', durationDays: 90, priceMinor: 150000, available: false, comingSoon: true, description: 'Advanced power tools and expanded resources for serious exam preparation.' },
];

const DEFAULT_ORG_PLANS = [
  { key: 'free', name: 'Free', priceMinor: 0, interval: 'month', available: true },
  { key: 'pro', name: 'Pro', priceMinor: 700000, interval: 'month', available: true },
  { key: 'studio', name: 'Studio', priceMinor: 2000000, interval: 'month', available: true },
];

/** Platform settings. Edits stay local until you press Save. */
function SettingsScreen() {
  const { data, isLoading, error } = useAdminSettings();
  if (error) return <Screen width="lg"><LoadError error={error} what="settings" /></Screen>;
  if (isLoading || !data) return <Screen width="lg"><Skeleton className="mt-8 h-80 w-full rounded-[20px]" /></Screen>;
  return <Form key={data.updatedAt ?? 'settings'} settings={data} />;
}

function Form({ settings }) {
  const toast = useToast();
  const qc = useQueryClient();

  const initialForm = {
    ...settings,
    studentPlans: settings.studentPlans?.length ? settings.studentPlans : DEFAULT_STUDENT_PLANS,
    orgPlans: settings.orgPlans?.length ? settings.orgPlans : DEFAULT_ORG_PLANS,
    platformPercent: settings.platformPercent ?? 5,
  };

  const [f, setF] = useState(initialForm);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const updateStudentPlan = (key, patch) => {
    setF((x) => ({
      ...x,
      studentPlans: (x.studentPlans || DEFAULT_STUDENT_PLANS).map((p) => (p.key === key ? { ...p, ...patch } : p)),
    }));
  };

  const updateOrgPlan = (key, patch) => {
    setF((x) => ({
      ...x,
      orgPlans: (x.orgPlans || DEFAULT_ORG_PLANS).map((p) => (p.key === key ? { ...p, ...patch } : p)),
    }));
  };

  const save = useAdminMutation(adminApi.updateSettings, {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['landing'] });
      qc.invalidateQueries({ queryKey: ['tenant'] });
      qc.invalidateQueries({ queryKey: ['billing'] });
      toast.success('Settings and plan prices saved successfully!');
    },
    onError: (e) => toast.error('Could not save', e.message),
  });

  const handleSave = () => {
    save.mutate({
      isPostUtmeActive: f.isPostUtmeActive,
      postUtmePrice: f.postUtmePrice,
      paymentBankName: f.paymentBankName,
      paymentAccountNumber: f.paymentAccountNumber,
      paymentAccountName: f.paymentAccountName,
      platformPercent: Number(f.platformPercent ?? 5),
      studentPlans: f.studentPlans,
      orgPlans: f.orgPlans,
    });
  };

  const dirty = JSON.stringify(f) !== JSON.stringify(initialForm);

  const proOrg = f.orgPlans?.find((p) => p.key === 'pro') ?? { priceMinor: 700000, available: true };
  const studioOrg = f.orgPlans?.find((p) => p.key === 'studio') ?? { priceMinor: 2000000, available: true };
  const plusStudent = f.studentPlans?.find((p) => p.key === 'pass_30d') ?? { priceMinor: 50000, available: true };
  const proStudent = f.studentPlans?.find((p) => p.key === 'pass_90d') ?? { priceMinor: 150000, available: false, comingSoon: true };

  return (
    <Screen width="lg">
      <PageHeader
        title="Settings"
        subtitle="Platform-wide pricing, subscriptions, and operational controls."
        action={
          <Button
            size="md"
            variant="primary"
            loading={save.isPending}
            onClick={handleSave}
          >
            Save All Changes
          </Button>
        }
      />
      <div className="mt-8 space-y-6 pb-24">

        {/* 1. TestFlow for Everyone Plans (Organizations & CBT Centers) */}
        <Card padding="lg" className="space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 size={20} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-base font-bold text-foreground-strong">
                    TestFlow for Everyone Plans (CBT Organizers)
                  </h2>
                  <Badge variant="lavender">Monthly Subscriptions</Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  Control subscription prices for schools, tutors, and organizations hosting their own branded CBT portal.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              loading={save.isPending}
              onClick={handleSave}
            >
              Save Plans
            </Button>
          </div>

          <div className="space-y-4">
            {/* Free Tier */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/80 bg-surface-strong/20 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground-strong">Free Plan</span>
                  <Badge variant="outline">Starter</Badge>
                </div>
                <p className="text-xs text-muted mt-0.5">Up to 3 exams, basic branding on testflow.com.ng.</p>
              </div>
              <div className="font-heading font-bold text-foreground-strong sm:text-right">
                ₦0 <span className="text-xs font-normal text-muted">/ month</span>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="rounded-2xl border border-border p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground-strong">Pro Plan</span>
                    <Badge variant="accent">Unlimited Exams</Badge>
                  </div>
                  <p className="text-xs text-muted mt-0.5">Unlimited anytime exams, question banks, announcements, and student reports.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Active:</span>
                  <Switch
                    checked={proOrg.available !== false}
                    onCheckedChange={(v) => updateOrgPlan('pro', { available: v })}
                    aria-label="Pro plan available"
                  />
                </div>
              </div>
              <div className="max-w-xs">
                <Field label="Monthly price (₦)" hint={`Organizers are billed ${formatMoney(proOrg.priceMinor || 0)}/month via Paystack.`}>
                  <Input
                    type="number"
                    min="0"
                    step="500"
                    value={(proOrg.priceMinor ?? 0) / 100}
                    onChange={(e) => updateOrgPlan('pro', { priceMinor: Math.round(Number(e.target.value || 0) * 100) })}
                  />
                </Field>
              </div>
            </div>

            {/* Studio Tier */}
            <div className="rounded-2xl border border-border p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground-strong">Studio Plan</span>
                    <Badge variant="success">All Perks + Monetization</Badge>
                  </div>
                  <p className="text-xs text-muted mt-0.5">Charge students for exams, Live CBT with synced timer, custom domains, 0 ads.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Active:</span>
                  <Switch
                    checked={studioOrg.available !== false}
                    onCheckedChange={(v) => updateOrgPlan('studio', { available: v })}
                    aria-label="Studio plan available"
                  />
                </div>
              </div>
              <div className="max-w-xs">
                <Field label="Monthly price (₦)" hint={`Organizers are billed ${formatMoney(studioOrg.priceMinor || 0)}/month via Paystack.`}>
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    value={(studioOrg.priceMinor ?? 0) / 100}
                    onChange={(e) => updateOrgPlan('studio', { priceMinor: Math.round(Number(e.target.value || 0) * 100) })}
                  />
                </Field>
              </div>
            </div>

            {/* Platform Revenue Share */}
            <div className="rounded-2xl border border-border/80 bg-surface-strong/30 p-4">
              <Field
                label="TestFlow platform fee on student payments (%)"
                hint="When an organizer charges for an exam, TestFlow retains this percentage and Paystack splits 95% straight to the organizer's bank."
              >
                <div className="max-w-xs">
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={f.platformPercent ?? 5}
                    onChange={(e) => set('platformPercent', Math.min(50, Math.max(0, Number(e.target.value || 0))))}
                  />
                </div>
              </Field>
            </div>
          </div>
        </Card>

        {/* 2. Normal TestFlow (Student Pass) Plans */}
        <Card padding="lg" className="space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <GraduationCap size={20} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-base font-bold text-foreground-strong">
                    Normal TestFlow Plans (Student Passes)
                  </h2>
                  <Badge variant="outline">One-time Passes</Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  Prices and availability for individual students practicing for JAMB, WAEC, and Post-UTME.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              loading={save.isPending}
              onClick={handleSave}
            >
              Save Passes
            </Button>
          </div>

          <div className="space-y-4">
            {/* Plus Pass (30 Days) */}
            <div className="rounded-2xl border border-border p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground-strong">Plus Plan (30 Days)</span>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <p className="text-xs text-muted mt-0.5">30 days of ad-free study, Live CBT, early AI access, and custom CBT creation.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Available:</span>
                  <Switch
                    checked={plusStudent.available !== false}
                    onCheckedChange={(v) => updateStudentPlan('pass_30d', { available: v })}
                    aria-label="Plus pass available"
                  />
                </div>
              </div>
              <div className="max-w-xs">
                <Field label="Pass price (₦)" hint={`Students pay ${formatMoney(plusStudent.priceMinor || 0)} for a 30-day pass.`}>
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    value={(plusStudent.priceMinor ?? 0) / 100}
                    onChange={(e) => updateStudentPlan('pass_30d', { priceMinor: Math.round(Number(e.target.value || 0) * 100) })}
                  />
                </Field>
              </div>
            </div>

            {/* Pro Pass (90 Days) */}
            <div className="rounded-2xl border border-border p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground-strong">Pro Plan (90 Days)</span>
                    <Badge variant="outline">{proStudent.comingSoon ? 'Coming Soon' : 'Available'}</Badge>
                  </div>
                  <p className="text-xs text-muted mt-0.5">Advanced power tools and expanded resources for serious exam preparation.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Available:</span>
                  <Switch
                    checked={proStudent.available === true}
                    onCheckedChange={(v) => updateStudentPlan('pass_90d', { available: v, comingSoon: !v })}
                    aria-label="Pro pass available"
                  />
                </div>
              </div>
              <div className="max-w-xs">
                <Field label="Pass price (₦)" hint={`Students pay ${formatMoney(proStudent.priceMinor || 0)} for a 90-day pass.`}>
                  <Input
                    type="number"
                    min="0"
                    step="500"
                    value={(proStudent.priceMinor ?? 0) / 100}
                    onChange={(e) => updateStudentPlan('pass_90d', { priceMinor: Math.round(Number(e.target.value || 0) * 100) })}
                  />
                </Field>
              </div>
            </div>
          </div>
        </Card>

        {/* 3. Post-UTME */}
        <Card padding="lg" className="space-y-5">
          <div>
            <h2 className="font-heading text-base font-bold text-foreground-strong">Post-UTME Access</h2>
            <p className="text-sm text-muted">Access controls and individual practice fee for Post-UTME past questions.</p>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
            <div>
              <p className="text-sm font-semibold text-foreground-strong">Post-UTME is open</p>
              <p className="text-xs text-muted">Turn off to pause access for everyone.</p>
            </div>
            <Switch checked={Boolean(f.isPostUtmeActive)} onCheckedChange={(v) => set('isPostUtmeActive', v)} aria-label="Post-UTME is open" />
          </div>
          <Field label="Price (₦)">
            <Input type="number" min="0" value={f.postUtmePrice ?? 0} onChange={(e) => set('postUtmePrice', Number(e.target.value))} />
          </Field>
        </Card>

        {/* 4. Payment Account (Direct Transfer) */}
        <Card padding="lg" className="space-y-5">
          <div>
            <h2 className="font-heading text-base font-bold text-foreground-strong">Direct Bank Transfer Account</h2>
            <p className="text-sm text-muted">Where students can send manual bank transfers. Shown to them at checkout.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bank">
              <Input value={f.paymentBankName ?? ''} onChange={(e) => set('paymentBankName', e.target.value)} />
            </Field>
            <Field label="Account number">
              <Input inputMode="numeric" value={f.paymentAccountNumber ?? ''} onChange={(e) => set('paymentAccountNumber', e.target.value)} />
            </Field>
          </div>
          <Field label="Account name">
            <Input value={f.paymentAccountName ?? ''} onChange={(e) => set('paymentAccountName', e.target.value)} />
          </Field>
        </Card>

        {/* 5. Data Retention & Lifecycle */}
        <DataRetentionCard />
      </div>

      <StickyActionBar
        dirty={dirty}
        saving={save.isPending}
        onDiscard={() => setF(initialForm)}
        onSave={handleSave}
      />
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
