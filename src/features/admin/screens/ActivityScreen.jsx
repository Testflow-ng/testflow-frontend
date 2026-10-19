import { useState } from 'react';
import { Badge, SearchField, SegmentedControl } from '../../../components/ui/index.js';
import DataTable from '../../../components/data/DataTable.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { useActivity } from '../useAdmin.js';
import { LoadError, TableSkeleton } from './shared.jsx';

const pretty = (a) => a.toLowerCase().replaceAll('_', ' ');
const tone = (a) => (/DELETE|REFUND|REVOKE|REJECT|SUSPEND/.test(a) ? 'danger' : /CREATE|APPROVE|GRANT|IMPORT/.test(a) ? 'success' : 'lavender');
const detail = (m) => (m && typeof m === 'object' ? Object.entries(m).filter(([, v]) => typeof v !== 'object').slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' · ') : '');

/** Every admin action, newest first. */
function ActivityScreen() {
  const [limit, setLimit] = useState('100');
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useActivity(Number(limit));
  const needle = search.trim().toLowerCase();
  const rows = (data?.logs ?? [])
    .filter((l) => !needle || `${l.action} ${l.actor?.fullName ?? ''} ${l.targetType ?? ''}`.toLowerCase().includes(needle))
    .map((l) => ({ ...l, id: l._id ?? l.id, when: l.createdAt }));

  const columns = [
    { key: 'when', header: 'When', sortable: true, render: (l) => new Date(l.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) },
    { key: 'actor', header: 'Who', render: (l) => <span className="font-semibold text-foreground-strong">{l.actor?.fullName ?? 'System'}</span> },
    { key: 'action', header: 'Action', render: (l) => <Badge variant={tone(l.action)}>{pretty(l.action)}</Badge> },
    { key: 'targetType', header: 'On', render: (l) => l.targetType ?? <span className="text-muted">-</span> },
    { key: 'metadata', header: 'Details', render: (l) => <span className="text-xs text-muted">{detail(l.metadata)}</span> },
  ];

  return (
    <Screen width="full">
      <PageHeader title="Audit log" subtitle="Every admin action, newest first." />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <SearchField className="max-w-sm flex-1" value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search by person or action" />
        <SegmentedControl label="How many" size="sm" value={limit} onValueChange={setLimit} options={['50', '100', '200'].map((v) => ({ value: v, label: `Last ${v}` }))} />
      </div>
      <div className="mt-4">
        {error ? <LoadError error={error} what="the audit log" /> : isLoading ? <TableSkeleton /> : <DataTable caption="Audit log" columns={columns} rows={rows} pageSize={15} initialSort={{ key: 'when', dir: 'desc' }} emptyMessage="No activity matches." />}
      </div>
    </Screen>
  );
}

export default ActivityScreen;
