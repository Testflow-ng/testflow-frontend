import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Banknote, Megaphone, ShieldCheck, Users, Plus, Play, Pause, Trash2, ExternalLink, Sparkles, Check } from 'lucide-react';
import { Badge, Banner, Button, Card, ConfirmDialog, Field, FileUpload, Input, KeyValueList, Modal, Skeleton, Switch, Tabs, TabPanel, useToast } from '../../../components/ui/index.js';
import StatCard from '../../../components/data/StatCard.jsx';
import AdsReviewQueue from '../../../components/ads/AdsReviewQueue.jsx';
import AdsPaymentsTable from '../../../components/ads/AdsPaymentsTable.jsx';
import SponsoredCard from '../../../components/ads/SponsoredCard.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { formatMoney } from '../../../utils/money.js';
import { adminApi } from '../api.js';
import { useAdminMutation, useAdsCampaigns, useAdsOverview, useAdsPayments, useAdsSettings, useAdvertisingHealth, useHouseAds } from '../useAdmin.js';
import { LoadError } from './shared.jsx';

const TABS = [
  { value: 'house_ads', label: 'House Ads (Promos)' },
  { value: 'campaigns', label: 'Advertiser Campaigns' },
  { value: 'payments', label: 'Payments' },
  { value: 'settings', label: 'Settings and health' },
];

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
  const [tab, setTab] = useState('house_ads');
  const overview = useAdsOverview();
  const by = overview.data?.campaignsByStatus ?? {};

  return (
    <Screen width="full">
      <PageHeader title="Ads" subtitle="Advertiser campaigns, house ads and Google AdSense." />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Waiting for review" value={by.pending_review ?? 0} icon={Megaphone} tone="accent" />
        <StatCard label="Live now" value={by.active ?? 0} icon={Users} tone="sage" />
        <StatCard label="Revenue" value={formatMoney(overview.data?.revenue?.amountKobo ?? 0)} icon={Banknote} tone="primary" trendLabel={`${overview.data?.revenue?.payments ?? 0} payments`} />
        <StatCard label="Suspended" value={by.suspended ?? 0} icon={ShieldCheck} tone="warning" />
      </div>
      <div className="mt-8"><Tabs idPrefix="ads" label="Ads sections" items={TABS} value={tab} onValueChange={setTab} /></div>
      <div className="mt-6">
        <TabPanel idPrefix="ads" value="house_ads" active={tab}><HouseAds /></TabPanel>
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

const AVAILABLE_PLACEMENTS = [
  { id: 'dashboard', label: 'Student Dashboard', desc: 'Bottom of the student home screen' },
  { id: 'post_activity', label: 'Result Gate (3s Countdown)', desc: 'Full countdown ad gate right after finishing test' },
  { id: 'in_result', label: 'In-Between Result Corrections', desc: 'Compact inline strip inside question review' },
  { id: 'library', label: 'Library Shelf', desc: 'Bottom of subjects and past questions bank' },
  { id: 'tenant_portal', label: 'TestFlow for Everyone', desc: 'Student portal for organizations & schools' },
];

function HouseAds() {
  const toast = useToast();
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin'] });
  const { data: houseAds = [], isLoading, error } = useHouseAds();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    title: 'Upgrade to TestFlow Plus',
    description: 'Get unlimited CBT practice, in-depth AI explanations, and zero ads for just ₦500/month.',
    imageUrl: '',
    ctaType: 'url',
    destinationUrl: '/billing',
    whatsapp: '',
    ctaLabel: 'Get Plus Pass',
    keywords: 'jamb, waec, plus, practice',
    durationDays: 365,
    placements: ['dashboard', 'post_activity', 'in_result', 'library', 'tenant_portal'],
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadError('');
    setUploading(true);
    setUploadProgress(25);
    setUploadedFileName(file.name);
    try {
      setUploadProgress(65);
      const asset = await adminApi.uploadHouseAdImage(file);
      setUploadProgress(100);
      setForm((prev) => ({ ...prev, imageUrl: asset.url }));
      toast.success('Image uploaded successfully!');
    } catch (err) {
      setUploadError(err.message || 'Failed to upload image');
      toast.error('Upload failed', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: '' }));
    setUploadedFileName('');
    setUploadProgress(0);
    setUploadError('');
  };

  const createMutation = useAdminMutation(adminApi.createHouseAd, {
    onSuccess: () => {
      toast.success('House ad published successfully!');
      setModalOpen(false);
      refresh();
    },
    onError: (err) => toast.error('Could not create house ad', err.message),
  });

  const toggleMutation = useAdminMutation(
    ({ id, status }) => adminApi.updateHouseAd(id, { status }),
    {
      onSuccess: () => {
        toast.success('House ad status updated');
        refresh();
      },
      onError: (err) => toast.error('Failed to update status', err.message),
    }
  );

  const deleteMutation = useAdminMutation(
    (id) => adminApi.deleteHouseAd(id),
    {
      onSuccess: () => {
        toast.success('House ad deleted');
        setDeleteTarget(null);
        refresh();
      },
      onError: (err) => toast.error('Failed to delete house ad', err.message),
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    const keywords = form.keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    createMutation.mutate({
      title: form.title,
      description: form.description,
      imageUrl: form.imageUrl,
      destination: form.ctaType === 'whatsapp'
        ? { type: 'whatsapp', whatsapp: form.whatsapp }
        : { type: 'url', url: form.destinationUrl || '/billing' },
      keywords,
      durationDays: Number(form.durationDays) || 365,
      placements: form.placements.length > 0 ? form.placements : ['all'],
    });
  };

  if (error) return <LoadError error={error} what="house ads" />;

  const previewAd = {
    title: form.title || 'Ad Headline',
    description: form.description || 'Ad description body text.',
    imageUrl: form.imageUrl,
  };
  const previewCta = {
    type: form.ctaType,
    href: form.ctaType === 'whatsapp' ? `https://wa.me/${form.whatsapp}` : form.destinationUrl || '/billing',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground-strong">TestFlow House Ads</h2>
          <p className="text-sm text-muted">
            Internal promos (Plus upgrades, CBT invites, mock exams) served directly to students across TestFlow.
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          leadingIcon={<Plus size={16} />}
          variant="primary"
        >
          Create House Ad
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : houseAds.length === 0 ? (
        <Card padding="lg" className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles size={28} />
          </div>
          <h3 className="mt-4 font-heading text-base font-bold text-foreground-strong">No house ads created yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Create your first house ad to promote TestFlow Plus subscriptions or upcoming CBT exam rooms!
          </p>
          <Button
            className="mt-5"
            onClick={() => setModalOpen(true)}
            leadingIcon={<Plus size={16} />}
          >
            Create House Ad
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {houseAds.map((ad) => {
            const isActive = ad.status === 'active';
            const stats = ad.stats || {};
            const impressions = stats.impressions || 0;
            const clicks = (stats.clicks || 0) + (stats.whatsappClicks || 0);
            const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : '0.0';

            return (
              <Card key={ad.id || ad._id} padding="none" className="overflow-hidden flex flex-col justify-between">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={isActive ? 'success' : 'outline'}>
                      {isActive ? 'Active' : ad.status}
                    </Badge>
                    <span className="text-xs text-muted">
                      {ad.durationDays} days run
                    </span>
                  </div>

                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-surface-strong">
                    {ad.image?.url ? (
                      <img src={ad.image.url} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground-strong line-clamp-1">
                      {ad.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted line-clamp-2">
                      {ad.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-surface-subtle p-2 text-center text-xs">
                    <div>
                      <span className="block font-bold text-foreground-strong">{impressions}</span>
                      <span className="text-[10px] text-muted">Views</span>
                    </div>
                    <div>
                      <span className="block font-bold text-foreground-strong">{clicks}</span>
                      <span className="text-[10px] text-muted">Clicks</span>
                    </div>
                    <div>
                      <span className="block font-bold text-foreground-strong">{ctr}%</span>
                      <span className="text-[10px] text-muted">CTR</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-semibold text-muted">Placements:</span>
                    {(!ad.placements || ad.placements.includes('all') || ad.placements.length === 0) ? (
                      <Badge variant="outline" className="text-[10px] py-0 px-2">All Screens</Badge>
                    ) : (
                      ad.placements.map((p) => {
                        const match = AVAILABLE_PLACEMENTS.find((opt) => opt.id === p);
                        return (
                          <Badge key={p} variant="secondary" className="text-[10px] py-0 px-1.5">
                            {match?.label ? match.label.split(' ')[0] : p}
                          </Badge>
                        );
                      })
                    )}
                  </div>

                  {ad.destination?.url && (
                    <a
                      href={ad.destination.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <ExternalLink size={12} />
                      <span className="truncate">{ad.destination.url}</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-border bg-surface-subtle/50 px-4 py-3">
                  <Button
                    size="sm"
                    variant={isActive ? 'outline' : 'primary'}
                    leadingIcon={isActive ? <Pause size={14} /> : <Play size={14} />}
                    onClick={() => toggleMutation.mutate({ id: ad.id || ad._id, status: isActive ? 'suspended' : 'active' })}
                  >
                    {isActive ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger hover:bg-danger/10"
                    leadingIcon={<Trash2 size={14} />}
                    onClick={() => setDeleteTarget(ad.id || ad._id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Create House Ad"
        size="2xl"
      >
        <div className="grid gap-8 p-1 md:grid-cols-[1.25fr_1fr]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Ad Title / Headline" required>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Upgrade to TestFlow Plus"
                required
              />
            </Field>

            <Field label="Description" required>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                rows={3}
                placeholder="Ad body copy..."
                required
              />
            </Field>

            <div className="space-y-3 rounded-2xl border border-border bg-surface-subtle/40 p-4">
              <FileUpload
                label="Ad Image / Banner"
                accept="image/png,image/jpeg,image/webp"
                maxBytes={5 * 1024 * 1024}
                hint="Upload a JPEG, PNG, or WebP image (up to 5 MB)."
                previewUrl={form.imageUrl || undefined}
                fileName={uploadedFileName || (form.imageUrl ? 'Image ready' : undefined)}
                progress={uploading ? uploadProgress : form.imageUrl ? 100 : undefined}
                error={uploadError}
                onFile={handleFileUpload}
                onRemove={handleRemoveImage}
              />

              <div className="pt-1">
                <Field label="Or paste an image URL directly">
                  <Input
                    value={form.imageUrl}
                    onChange={(e) => {
                      setForm({ ...form, imageUrl: e.target.value });
                      if (!e.target.value) setUploadedFileName('');
                    }}
                    placeholder="https://cdn.testflow.com.ng/... or https://..."
                  />
                </Field>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Destination Type">
                <select
                  value={form.ctaType}
                  onChange={(e) => setForm({ ...form, ctaType: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="url">Web Link / Route</option>
                  <option value="whatsapp">WhatsApp Chat</option>
                </select>
              </Field>

              <Field label="Duration (Days)">
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={form.durationDays}
                  onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                />
              </Field>
            </div>

            {form.ctaType === 'url' ? (
              <Field label="Destination URL / Route" required>
                <Input
                  value={form.destinationUrl}
                  onChange={(e) => setForm({ ...form, destinationUrl: e.target.value })}
                  placeholder="/billing or https://..."
                  required
                />
              </Field>
            ) : (
              <Field label="WhatsApp Number (with country code)" required>
                <Input
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="2348012345678"
                  required
                />
              </Field>
            )}

            <Field label="Target Keywords (comma-separated)">
              <Input
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                placeholder="jamb, waec, plus"
              />
            </Field>

            <div className="space-y-2.5 rounded-2xl border border-border bg-surface-subtle/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground-strong">
                    Target Placements
                  </span>
                  <p className="text-[11px] text-muted">
                    Choose which screens and flows students will see this ad on:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const allIds = AVAILABLE_PLACEMENTS.map((p) => p.id);
                    const hasAll = form.placements.length === allIds.length;
                    setForm({ ...form, placements: hasAll ? [] : allIds });
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {form.placements.length === AVAILABLE_PLACEMENTS.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {AVAILABLE_PLACEMENTS.map((p) => {
                  const selected = form.placements.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        const next = selected
                          ? form.placements.filter((id) => id !== p.id)
                          : [...form.placements, p.id];
                        setForm({ ...form, placements: next });
                      }}
                      className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                        selected
                          ? 'border-primary bg-primary/5 text-foreground-strong ring-1 ring-primary/40'
                          : 'border-border bg-surface hover:border-border-strong text-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex size-4 items-center justify-center rounded border transition ${
                            selected ? 'border-primary bg-primary text-white' : 'border-border bg-surface'
                          }`}
                        >
                          {selected && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-bold text-foreground-strong">{p.label}</span>
                      </div>
                      <span className="mt-1 text-[10px] text-muted leading-tight">{p.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={createMutation.isPending || uploading}>
                Publish Ad
              </Button>
            </div>
          </form>

          {/* Live Preview */}
          <div className="flex flex-col items-center justify-start rounded-2xl border border-dashed border-border bg-surface-subtle p-6">
            <span className="mb-4 text-xs font-bold uppercase tracking-wider text-muted">
              Live Student Preview
            </span>
            <div className="w-full max-w-[340px]">
              <SponsoredCard
                ad={previewAd}
                cta={previewCta}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete House Ad"
        description="Are you sure you want to remove this house ad? It will stop serving to students immediately."
        tone="danger"
        confirmLabel="Delete Ad"
        onConfirm={() => deleteMutation.mutate(deleteTarget)}
      />
    </div>
  );
}

export default AdsScreen;
