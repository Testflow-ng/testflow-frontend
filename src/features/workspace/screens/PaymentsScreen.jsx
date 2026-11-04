import { useMemo, useState } from 'react';
import { ChevronDown, Download, FileText, Landmark, Printer, Receipt, Wallet } from 'lucide-react';
import { Button, Card, DropdownMenu, EmptyState, IconButton, Reveal, SearchField, SegmentedControl, Skeleton, StatusBadge, useToast } from '../../../components/ui/index.js';
import DataTable from '../../../components/data/DataTable.jsx';
import { BrandBarChart } from '../../../components/data/charts.jsx';
import PlanLock from '../../../components/everybody/PlanLock.jsx';
import { usePlanFeatures } from '../usePlanFeatures.js';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { ICON } from '../../../components/ui/iconProps.js';
import { formatMoney } from '../../../utils/money.js';
import { downloadStatementCsv, printReceipt, printStatement, summarize } from '../invoice.js';
import { useOrg } from '../OrgContext.js';
import PayoutCard from '../PayoutCard.jsx';
import { usePayments, useSite } from '../useWorkspace.js';
import { fmtDate } from '../../admin/screens/format.js';

const PERIODS = [
  { value: '7', label: '7 days', days: 7 },
  { value: '30', label: '30 days', days: 30 },
  { value: '90', label: '90 days', days: 90 },
  { value: 'all', label: 'All time', days: null },
];
const DAY = 86400000;

/** Your earnings: what students paid, what you keep, where it goes, and every payment with a receipt. */
function PaymentsScreen() {
  const toast = useToast();
  const { org } = useOrg();
  const brand = useSite().data?.brand;
  const [period, setPeriod] = useState('30');
  const [search, setSearch] = useState('');
  const { data, isLoading } = usePayments({ limit: 500 });
  const meta = PERIODS.find((p) => p.value === period);
  const [now] = useState(() => Date.now());

  const all = useMemo(() => (data?.items ?? []).map((p) => ({ ...p, id: p.id })), [data]);
  const rows = useMemo(() => {
    const from = meta.days ? now - meta.days * DAY : 0;
    return all.filter((p) => new Date(p.paidAt).getTime() >= from);
  }, [all, meta, now]);
  const shown = rows.filter((p) => !search.trim() || `${p.item} ${p.reference ?? ''} ${p.studentName ?? ''}`.toLowerCase().includes(search.trim().toLowerCase()));
  const t = summarize(rows);
  const periodLabel = meta.days ? `Last ${meta.days} days` : 'All time';

  const byDay = useMemo(() => {
    const map = new Map();
    rows.filter((p) => p.status === 'paid').forEach((p) => { const d = String(p.paidAt).slice(0, 10); map.set(d, (map.get(d) ?? 0) + p.orgShareKobo); });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([d, v]) => ({ name: d.slice(5), value: Math.round(v / 100) }));
  }, [rows]);
  const byItem = useMemo(() => {
    const map = new Map();
    rows.filter((p) => p.status === 'paid').forEach((p) => map.set(p.item, (map.get(p.item) ?? 0) + p.orgShareKobo));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [rows]);

  const statement = () => { if (!printStatement({ org, brand, payments: rows, periodLabel })) toast.error('Allow pop-ups to download the statement'); };
  const receipt = (p) => { if (!printReceipt({ org, brand, payment: p })) toast.error('Allow pop-ups to download the receipt'); };

  const columns = [
    { key: 'paidAt', header: 'Date', sortable: true, render: (p) => fmtDate(p.paidAt) },
    { key: 'item', header: 'For', render: (p) => <span><span className="font-semibold text-foreground-strong">{p.item}</span>{p.studentName && <span className="block text-xs text-muted">{p.studentName}</span>}</span> },
    { key: 'grossKobo', header: 'Student paid', align: 'right', render: (p) => formatMoney(p.grossKobo) },
    { key: 'platformFeeKobo', header: 'Testflow share', align: 'right', render: (p) => <span className="text-muted">-{formatMoney(p.platformFeeKobo)}</span> },
    { key: 'orgShareKobo', header: 'You receive', align: 'right', render: (p) => <span className="font-semibold text-foreground-strong">{formatMoney(p.orgShareKobo)}</span> },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status === 'paid' ? 'paid' : p.status === 'refunded' ? 'refunded' : 'failed'} /> },
  ];

  const { canCharge } = usePlanFeatures();
  return (
    <Screen width="full">
      <PageHeader
        title="Earnings"
        subtitle="What students paid you, what you keep, and a receipt for every payment."
        action={
          <DropdownMenu placement="bottom-end" trigger={(p) => <Button variant="outline" size="sm" leadingIcon={<Download {...ICON} size={15} />} trailingIcon={<ChevronDown {...ICON} size={14} />} {...p}>Download</Button>}
            items={[{ label: 'Statement (PDF)', icon: Printer, onSelect: statement }, { label: 'Spreadsheet (CSV)', icon: FileText, onSelect: () => downloadStatementCsv(rows, periodLabel) }]} />
        }
      />
      <PlanLock locked={!canCharge} plan="Studio" title="Charging for exams is part of Studio" description="Charge students for an exam, get paid to your account, and download statements and receipts." className="mt-8">

      <div className="mt-6"><SegmentedControl label="Period" size="sm" value={period} onValueChange={setPeriod} options={PERIODS.map(({ value, label }) => ({ value, label }))} /></div>

      <div className="mt-6 space-y-8">
        <Reveal>
          {isLoading ? <Skeleton className="h-52 w-full rounded-[28px]" /> : (
            <div className="rounded-[28px] bg-secondary p-6 text-secondary-foreground sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">You received · {periodLabel}</p>
                  <p className="mt-2 font-heading text-5xl font-extrabold tracking-tight text-white sm:text-6xl">{formatMoney(t.net)}</p>
                </div>
                <span className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-accent"><Wallet size={26} strokeWidth={1.5} aria-hidden="true" /></span>
              </div>
              <dl className="mt-8 grid gap-6 sm:grid-cols-3">
                {[['Students paid', formatMoney(t.gross)], [`Testflow share (${org.payout?.platformPercent ?? 10}%)`, `-${formatMoney(t.fee)}`], ['Payments', t.count]].map(([k, v]) => <div key={k}><dt className="text-sm text-white/60">{k}</dt><dd className="mt-1 font-heading text-2xl font-extrabold text-white">{v}</dd></div>)}
              </dl>
              <p className="mt-6 flex items-center gap-2 text-sm text-white/70"><Landmark size={15} aria-hidden="true" />{org.payout?.status === 'active' ? `Paid to ${org.payout.accountName ?? 'your account'}` : 'Add a payout account to receive your money'}</p>
            </div>
          )}
        </Reveal>

        <Reveal delay={0.06}>
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
            <div className="space-y-6">
              <Card padding="lg">
                <h2 className="font-heading text-base font-bold text-foreground-strong">Your earnings by day</h2>
                <p className="mb-4 text-sm text-muted">What you keep, in naira.</p>
                {byDay.length ? <BrandBarChart label="Earnings by day" height={240} animate highlightLast={false} data={byDay} /> : <p className="py-12 text-center text-sm text-muted">No payments in this period.</p>}
              </Card>
              <Card padding="lg">
                <h2 className="font-heading text-base font-bold text-foreground-strong">Where it comes from</h2>
                <p className="mb-4 text-sm text-muted">Your top exams by what you received.</p>
                {byItem.length ? (
                  <ul className="space-y-4">{byItem.map(([name, v]) => <li key={name}><div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="truncate font-semibold text-foreground-strong">{name}</span><span className="tabular-nums text-muted">{formatMoney(v)}</span></div><div className="h-2 overflow-hidden rounded-full bg-surface-strong"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(6, (v / byItem[0][1]) * 100)}%` }} /></div></li>)}</ul>
                ) : <p className="py-6 text-center text-sm text-muted">Nothing yet.</p>}
              </Card>
            </div>
            <PayoutCard org={org} />
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <section aria-labelledby="tx">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="tx" className="font-heading text-xl font-extrabold tracking-tight text-foreground-strong">Payments</h2>
              <SearchField className="w-full max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search exam, student or reference" />
            </div>
            {!isLoading && all.length === 0 ? (
              <EmptyState icon={Receipt} title="No payments yet" description="When a student pays for one of your exams it shows up here, with a receipt you can download." />
            ) : (
              <DataTable caption="Payments" columns={columns} rows={shown} pageSize={10} initialSort={{ key: 'paidAt', dir: 'desc' }} emptyMessage="No payments match." loading={isLoading}
                rowActions={(p) => <IconButton aria-label={`Download receipt for ${p.item}`} title="Download receipt" size="sm" variant="ghost" onClick={() => receipt(p)}><Receipt {...ICON} size={16} /></IconButton>} />
            )}
          </section>
        </Reveal>
      </div>
      </PlanLock>
    </Screen>
  );
}

export default PaymentsScreen;
