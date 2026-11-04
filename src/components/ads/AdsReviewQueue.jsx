import { useMemo, useState } from 'react';
import { Check, Eye, MoreHorizontal, Pause, Play, X } from 'lucide-react';
import DataTable from '../data/DataTable.jsx';
import Tabs, { TabPanel } from '../ui/Tabs.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import DropdownMenu from '../ui/DropdownMenu.jsx';
import IconButton from '../ui/IconButton.jsx';
import SearchField from '../ui/SearchField.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import RejectDialog from './RejectDialog.jsx';
import CampaignReviewModal from './CampaignReviewModal.jsx';
import { formatMoney } from '../../utils/money.js';

const GROUPS = [
  { value: 'pending_review', label: 'In review', test: (c) => c.status === 'pending_review' },
  { value: 'live', label: 'Live', test: (c) => c.status === 'active' || c.status === 'scheduled' },
  { value: 'suspended', label: 'Suspended', test: (c) => c.status === 'suspended' },
  { value: 'all', label: 'All', test: () => true },
];

/**
 * Admin review queue: tabs by group, search, sortable table, a row menu (Review, Approve, Reject, Suspend,
 * Reinstate) and the review dialog. Purely presentational: give it `campaigns` and the action callbacks,
 * each of which should call the admin Ads API and may return a promise.
 */
function AdsReviewQueue({ campaigns, loading = false, onApprove, onReject, onSuspend, onReinstate }) {
  const [group, setGroup] = useState('pending_review');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [suspending, setSuspending] = useState(null);

  const counts = useMemo(() => Object.fromEntries(GROUPS.map((g) => [g.value, campaigns.filter(g.test).length])), [campaigns]);
  const rows = useMemo(() => {
    const test = GROUPS.find((g) => g.value === group).test;
    const needle = q.trim().toLowerCase();
    return campaigns.filter((c) => test(c) && (!needle || `${c.title} ${c.advertiser}`.toLowerCase().includes(needle)));
  }, [campaigns, group, q]);
  const current = campaigns.find((c) => c.id === openId);

  const menu = (c) => [
    { label: 'Review', icon: Eye, onSelect: () => setOpenId(c.id) },
    ...(c.status === 'pending_review' ? [{ label: 'Approve', icon: Check, onSelect: () => onApprove?.(c) }, { label: 'Reject…', icon: X, danger: true, onSelect: () => setRejecting(c) }] : []),
    ...(c.status === 'active' || c.status === 'scheduled' ? [{ label: 'Suspend…', icon: Pause, danger: true, onSelect: () => setSuspending(c) }] : []),
    ...(c.status === 'suspended' ? [{ label: 'Reinstate', icon: Play, onSelect: () => onReinstate?.(c) }] : []),
  ];

  return (
    <div className="space-y-4">
      <Tabs idPrefix="review" label="Review groups" value={group} onValueChange={setGroup} items={GROUPS.map((g) => ({ value: g.value, label: g.label, count: counts[g.value] }))} />
      <TabPanel idPrefix="review" value={group} active={group}>
        <DataTable
          caption="Campaigns"
          loading={loading}
          pageSize={8}
          initialSort={{ key: 'submittedAt', dir: 'asc' }}
          emptyMessage="Nothing to review here."
          toolbar={<SearchField className="w-full sm:max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} placeholder="Search ad or advertiser" />}
          rows={rows}
          rowActions={(c) => (
            <DropdownMenu placement="bottom-end" items={menu(c)} trigger={(p) => <IconButton aria-label={`Actions for ${c.title}`} size="sm" variant="ghost" {...p}><MoreHorizontal size={18} /></IconButton>} />
          )}
          columns={[
            { key: 'title', header: 'Ad', sortable: true, render: (c) => <button type="button" onClick={() => setOpenId(c.id)} className="text-left font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">{c.title}</button> },
            { key: 'advertiser', header: 'Advertiser', sortable: true },
            { key: 'submittedAt', header: 'Submitted', sortable: true },
            { key: 'durationDays', header: 'Days', sortable: true, align: 'right' },
            { key: 'priceKobo', header: 'Paid', sortable: true, align: 'right', render: (c) => formatMoney(c.priceKobo) },
            { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
          ]}
        />
      </TabPanel>

      <CampaignReviewModal
        campaign={current}
        open={Boolean(current)}
        onOpenChange={(o) => !o && setOpenId(null)}
        onApprove={async (c) => (await onApprove?.(c), setOpenId(null))}
        onReject={(c) => (setOpenId(null), setRejecting(c))}
      />
      <RejectDialog open={Boolean(rejecting)} onOpenChange={(o) => !o && setRejecting(null)} onConfirm={(v) => onReject?.(rejecting, v)} />
      <ConfirmDialog open={Boolean(suspending)} onOpenChange={(o) => !o && setSuspending(null)} tone="danger" requireReason title="Suspend this ad?" description="It stops showing to students immediately. The paid period is not extended." confirmLabel="Suspend" onConfirm={(reason) => onSuspend?.(suspending, reason)} />
    </div>
  );
}

export default AdsReviewQueue;
