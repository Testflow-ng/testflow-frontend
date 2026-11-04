import { useState } from 'react';
import { Undo2 } from 'lucide-react';
import DataTable from '../data/DataTable.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { formatMoney } from '../../utils/money.js';

/**
 * Ad payments with refunds. Only payments marked `refundable` (their campaigns were rejected with a refund)
 * show the Refund button; it asks for a reason and calls `onRefund(payment, reason)`.
 * payment = { id, reference, advertiser, amountKobo, status, paidAt, refundable }.
 */
function AdsPaymentsTable({ payments, loading = false, onRefund }) {
  const [target, setTarget] = useState(null);
  return (
    <>
      <DataTable
        caption="Payments"
        loading={loading}
        rows={payments}
        initialSort={{ key: 'paidAt', dir: 'desc' }}
        emptyMessage="No payments yet."
        columns={[
          { key: 'reference', header: 'Reference', sortable: true, render: (p) => <span className="font-mono text-[13px]">{p.reference}</span> },
          { key: 'advertiser', header: 'Advertiser', sortable: true },
          { key: 'amountKobo', header: 'Amount', sortable: true, align: 'right', render: (p) => formatMoney(p.amountKobo) },
          { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
          { key: 'paidAt', header: 'Date', sortable: true },
        ]}
        rowActions={(p) =>
          p.refundable ? (
            <Button size="sm" variant="outline" onClick={() => setTarget(p)}>
              <Undo2 size={14} aria-hidden="true" /> Refund
            </Button>
          ) : null
        }
      />
      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(o) => !o && setTarget(null)}
        tone="danger"
        requireReason
        title={target ? `Refund ${formatMoney(target.amountKobo)}?` : 'Refund'}
        description="This refunds the whole payment through the provider. It can only be done once."
        confirmLabel="Refund"
        onConfirm={(reason) => onRefund?.(target, reason)}
      />
    </>
  );
}

export default AdsPaymentsTable;
