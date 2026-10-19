import { Download } from 'lucide-react';
import DataTable from '../data/DataTable.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Button from '../ui/Button.jsx';
import { formatMoney } from '../../utils/money.js';

/** Subscription payments. `payments` = [{ id, reference, planName, kind, amountKobo, currency, status, paidAt, receiptUrl? }]. */
function InvoiceTable({ payments, loading = false }) {
  return (
    <DataTable
      caption="Billing history"
      loading={loading}
      rows={payments}
      initialSort={{ key: 'paidAt', dir: 'desc' }}
      emptyMessage="No payments yet."
      columns={[
        { key: 'paidAt', header: 'Date', sortable: true },
        { key: 'reference', header: 'Reference', render: (p) => <span className="font-mono text-[13px]">{p.reference}</span> },
        { key: 'planName', header: 'Plan', sortable: true, render: (p) => `${p.planName} (${p.kind})` },
        { key: 'amountKobo', header: 'Amount', sortable: true, align: 'right', render: (p) => formatMoney(p.amountKobo, p.currency) },
        { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
      ]}
      rowActions={(p) => (p.receiptUrl ? <Button as="a" href={p.receiptUrl} size="sm" variant="ghost"><Download size={14} aria-hidden="true" /> Receipt</Button> : null)}
    />
  );
}

export default InvoiceTable;
