import { useState } from 'react';
import { Card, Field, Input, Skeleton, StickyActionBar, Switch, useToast } from '../../../components/ui/index.js';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { adminApi } from '../api.js';
import { useAdminMutation, useAdminSettings } from '../useAdmin.js';
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
      </div>
      <StickyActionBar dirty={dirty} onDiscard={() => setF(settings)} onSave={() => save.mutate({ isPostUtmeActive: f.isPostUtmeActive, postUtmePrice: f.postUtmePrice, paymentBankName: f.paymentBankName, paymentAccountNumber: f.paymentAccountNumber, paymentAccountName: f.paymentAccountName })} />
    </Screen>
  );
}

export default SettingsScreen;
