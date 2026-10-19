import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Banknote, Megaphone, ShieldCheck, Users } from 'lucide-react';
import { Badge, Banner, Button, Card, Field, Input, KeyValueList, Skeleton, Switch, Tabs, TabPanel, useToast } from '../../../components/ui/index.js';
import StatCard from '../../../components/data/StatCard.jsx';
import AdsReviewQueue from '../../../components/ads/AdsReviewQueue.jsx';
import AdsPaymentsTable from '../../../components/ads/AdsPaymentsTable.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { formatMoney } from '../../../utils/money.js';
import { adminApi } from '../api.js';
import { useAdminMutation, useAdsCampaigns, useAdsOverview, useAdsPayments, useAdsSettings, useAdvertisingHealth } from '../useAdmin.js';
import { LoadError } from './shared.jsx';

const TABS = [{ value: 'campaigns', label: 'Campaigns' }, { value: 'payments', label: 'Payments' }, { value: 'settings', label: 'Settings and health' }];

/** Maps an API campaign onto what the review queue draws. */
const toRow = (c) => ({
  id: c.id ?? c._id,
  status: c.status,
  title: c.title,
  description: c.description,
  imageUrl: c.imageUrl ?? c.image?.url,
  ctaType: c.destination?.type ?? c.ctaType,
  destination: c.destination?.url ?? (c.destination?.whatsapp ? `https://wa.me/${c.destination.whatsapp}` : c.destination),
  advertiser: c.advertiser?.fullName ?? c.advertiserName ?? c.name ?? '',
  durationDays: c.durationDays,
  priceKobo: c.priceKobo,
  keywords: c.keywords ?? [],
  submittedAt: c.submittedAt,
  history: c.history ?? [],
});

function AdsScreen() {
  const [tab, setTab] = useState('campaigns');
  const overview = useAdsOverview();
  const by = overview.data?.campaignsByStatus ?? {};

  return (
    <Screen width="full">
      <PageHeader title="Ads" subtitle="Advertiser campaigns, payments and Google AdSense." />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Waiting for review" value={by.pending_review ?? 0} icon={Megaphone} tone="accent" />
        <StatCard label="Live now" value={by.active ?? 0} icon={Users} tone="sage" />
        <StatCard label="Revenue" value={formatMoney(overview.data?.revenue?.amountKobo ?? 0)} icon={Banknote} tone="primary" trendLabel={`${overview.data?.revenue?.payments ?? 0} payments`} />
        <StatCard label="Suspended" value={by.suspended ?? 0} icon={ShieldCheck} tone="warning" />
      </div>
      <div className="mt-8"><Tabs idPrefix="ads" label="Ads sections" items={TABS} value={tab} onValueChange={setTab} /></div>
      <div className="mt-6">
        <TabPanel idPrefix="ads" value="campaigns" active={tab}><Campaigns /></TabPanel>
        <TabPanel idPrefix="ads" value="payments" active={tab}><Payments /></TabPanel>
        <TabPanel idPrefix="ads" value="settings" active={tab}><AdsSettings /></TabPanel>
      </div>
    </Screen>
  );
}

function Campaigns() {
  const toast = useToast();
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin'] });
  const { data, isLoading, error } = useAdsCampaigns({ limit: 100 });
  const act = (action, ok) => async (c, extra) => {
    try {
      await adminApi.adsCampaignAction(c.id, action, extra);
      toast.success(ok);
      return true;
    } catch (e) {
      toast.error('Could not update the ad', e.message);
      return false;
    } finally {
      refresh();
    }
  };
  if (error) return <LoadError error={error} what="campaigns" />;
  return (
    <AdsReviewQueue
      loading={isLoading}
      campaigns={(data?.items ?? []).map(toRow)}
      onApprove={act('approve', 'Ad approved')}
      onReject={(c, v) => act('reject', 'Ad rejected')(c, { reason: v.reason, refund: v.refund })}
      onSuspend={(c, reason) => act('suspend', 'Ad suspended')(c, { reason })}
      onReinstate={act('reinstate', 'Ad reinstated')}
    />
  );
}

function Payments() {
  const toast = useToast();
  const { data, isLoading, error } = useAdsPayments({ limit: 100 });
  const refund = useAdminMutation(({ p, reason }) => adminApi.adsRefund(p.id, { reason }), { onSuccess: () => toast.success('Refunded'), onError: (e) => toast.error('Could not refund', e.message) });
  if (error) return <LoadError error={error} what="payments" />;
  const rows = (data?.items ?? []).map((p) => ({
    id: p.id ?? p._id, reference: p.reference, advertiser: p.advertiser?.fullName ?? p.items?.[0]?.campaignName ?? '', amountKobo: p.amountKobo, status: p.status, paidAt: p.paidAt,
    refundable: p.status === 'paid' && (p.refundable ?? false),
  }));
  return <AdsPaymentsTable loading={isLoading} payments={rows} onRefund={(p, reason) => refund.mutateAsync({ p, reason })} />;
}

function AdsSettings() {
  const toast = useToast();
  const { data, isLoading, error } = useAdsSettings();
  const health = useAdvertisingHealth();
  const save = useAdminMutation(adminApi.updateAdsSettings, { onSuccess: () => toast.success('Ad settings saved'), onError: (e) => toast.error('Could not save', e.message) });
  const [draft, setDraft] = useState(null);

  if (error) return <LoadError error={error} what="ad settings" />;
  if (isLoading || !data) return <Skeleton className="h-72 w-full rounded-[20px]" />;

  const f = draft ?? { adsEnabled: data.adsEnabled, daily: data.dailyFeeKobo / 100, minDurationDays: data.minDurationDays, maxDurationDays: data.maxDurationDays, maxAdsPerStudentPerDay: data.maxAdsPerStudentPerDay };
  const set = (k) => (v) => setDraft({ ...f, [k]: v });
  const num = (k) => (e) => set(k)(Number(e.target.value));
  const h = health.data;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card padding="lg" className="space-y-5">
        <div><h2 className="font-heading text-base font-bold text-foreground-strong">Testflow Ads</h2><p className="text-sm text-muted">Rules for the advertiser marketplace.</p></div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4"><div><p className="text-sm font-semibold text-foreground-strong">Serve ads to students</p><p className="text-xs text-muted">The global switch. Off stops every advertiser ad.</p></div><Switch checked={f.adsEnabled} onCheckedChange={set('adsEnabled')} aria-label="Serve ads" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price per day (₦)"><Input type="number" min="0" value={f.daily} onChange={num('daily')} /></Field>
          <Field label="Ads per student per day"><Input type="number" min="1" value={f.maxAdsPerStudentPerDay} onChange={num('maxAdsPerStudentPerDay')} /></Field>
          <Field label="Shortest run (days)"><Input type="number" min="1" value={f.minDurationDays} onChange={num('minDurationDays')} /></Field>
          <Field label="Longest run (days)"><Input type="number" min="1" value={f.maxDurationDays} onChange={num('maxDurationDays')} /></Field>
        </div>
        <div className="flex justify-end"><Button loading={save.isPending} disabled={!draft} onClick={() => save.mutate({ adsEnabled: f.adsEnabled, dailyFeeKobo: Math.round(f.daily * 100), minDurationDays: f.minDurationDays, maxDurationDays: f.maxDurationDays, maxAdsPerStudentPerDay: f.maxAdsPerStudentPerDay }, { onSuccess: () => setDraft(null) })}>Save settings</Button></div>
      </Card>

      <Card padding="lg" className="space-y-4">
        <div><h2 className="font-heading text-base font-bold text-foreground-strong">Google AdSense and passes</h2><p className="text-sm text-muted">Set in the backend environment. Read only here.</p></div>
        {health.isLoading ? <Skeleton className="h-40 w-full rounded-xl" /> : health.error ? <LoadError error={health.error} what="ad health" /> : (
          <>
            <KeyValueList items={[
              { label: 'Google AdSense', value: <Badge variant={h.providers.google_adsense.enabled ? 'success' : 'outline'}>{h.providers.google_adsense.enabled ? 'On' : h.providers.google_adsense.requested ? 'Misconfigured' : 'Off'}</Badge> },
              { label: 'Testflow Ads', value: <Badge variant={h.providers.testflow.enabled ? 'success' : 'outline'}>{h.providers.testflow.enabled ? 'On' : 'Off'}</Badge> },
              { label: 'Placements on', value: `${h.placements.enabled} of ${h.placements.registered}` },
              { label: 'Ad-free passes live', value: h.entitlements.adFree },
              { label: 'Pass purchases', value: `${h.purchases.paid} paid, ${h.purchases.pending} pending` },
            ]} />
            {h.issues?.length > 0 && <div className="space-y-2">{h.issues.map((i) => <Banner key={i.code} variant={i.level === 'error' ? 'danger' : 'warning'}>{i.message}</Banner>)}</div>}
          </>
        )}
      </Card>
    </div>
  );
}

export default AdsScreen;
