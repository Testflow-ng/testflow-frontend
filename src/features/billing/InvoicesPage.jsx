import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, ExternalLink, FileText, Printer, Receipt, Sparkles } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Modal, Reveal, SkeletonCard, useToast } from '../../components/ui/index.js';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import Logo from '../../components/Logo.jsx';
import { formatMoney } from '../../utils/money.js';
import { useAuth } from '../auth/useAuth.js';
import { usePurchases } from './useBilling.js';

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const fmtDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function InvoicesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { data: purchases, isLoading, error } = usePurchases();
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [copied, setCopied] = useState(false);

  const copyRef = (ref) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    toast.success('Copied', 'Reference copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Screen width="lg">
      <PageHeader
        back="/profile"
        title="Invoices &amp; Receipts"
        subtitle="Review and download proof of your subscription payments."
        action={
          <Link to="/billing">
            <Button size="sm" variant="outline" leadingIcon={<Sparkles size={14} />}>
              Plans &amp; Passes
            </Button>
          </Link>
        }
      />

      <div className="mt-8 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard className="h-24" />
            <SkeletonCard className="h-24" />
          </div>
        ) : error ? (
          <Card padding="lg" className="text-center text-danger">
            <p>Could not load invoices. Check your connection and try again.</p>
          </Card>
        ) : !purchases || purchases.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No invoices yet"
            description="When you subscribe to TestFlow Plus, your receipts and transaction records will appear here."
            action={
              <Link to="/billing">
                <Button>Browse Plans</Button>
              </Link>
            }
          />
        ) : (
          <Reveal>
            <div className="space-y-3">
              {purchases.map((p) => {
                const isPaid = p.status === 'paid';
                const isPending = p.status === 'initialized';
                const isRefunded = p.status === 'refunded';
                const isAbandoned = p.status === 'abandoned';

                return (
                  <Card
                    key={p.id || p.reference}
                    padding="md"
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-lavender)] text-primary">
                        <FileText size={20} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-heading text-base font-bold text-foreground-strong">
                            {p.planName || 'TestFlow Plus'}
                          </p>
                          <Badge
                            variant={isPaid ? 'success' : isPending ? 'warning' : isRefunded ? 'lavender' : 'outline'}
                          >
                            {isPaid ? 'Paid' : isPending ? 'Pending' : isRefunded ? 'Refunded' : isAbandoned ? 'Expired' : 'Failed'}
                          </Badge>
                        </div>
                        <p className="mt-1 font-mono text-xs text-muted">Ref: {p.reference}</p>
                        <p className="text-xs text-muted sm:hidden mt-0.5">
                          {fmtDate(p.paidAt || p.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-3 sm:border-0 sm:pt-0 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="font-heading text-lg font-extrabold text-foreground-strong">
                          {formatMoney(p.amountKobo, p.currency)}
                        </p>
                        <p className="hidden text-xs text-muted sm:block">
                          {fmtDate(p.paidAt || p.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending && p.authorizationUrl ? (
                          <a href={p.authorizationUrl} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="primary" leadingIcon={<ExternalLink size={14} />}>
                              Pay Now
                            </Button>
                          </a>
                        ) : isPaid ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReceipt(p)}
                            leadingIcon={<Receipt size={14} />}
                          >
                            Receipt
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedReceipt(p)}
                          >
                            Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Reveal>
        )}
      </div>

      {/* Official Printable Receipt Modal */}
      {selectedReceipt && (
        <Modal
          open={Boolean(selectedReceipt)}
          onOpenChange={(open) => !open && setSelectedReceipt(null)}
          title="Payment Receipt"
          description={`Receipt for reference ${selectedReceipt.reference}`}
        >
          <div className="space-y-6 print:p-0">
            {/* Printable Receipt Container */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm print:border-none print:shadow-none print:p-0">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
                <div>
                  <Logo size={28} withWordmark={true} />
                  <p className="mt-2 text-xs text-muted">TestFlow Educational Technologies</p>
                  <p className="text-xs text-muted">hello@testflow.com.ng</p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full bg-[var(--brand-sage)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                    Official Receipt
                  </span>
                  <p className="mt-2 font-mono text-xs text-muted">#{selectedReceipt.reference}</p>
                </div>
              </div>

              {/* Billed To & Date */}
              <div className="mt-5 grid gap-4 text-xs sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-muted uppercase tracking-wider">Billed To</p>
                  <p className="mt-1 font-bold text-foreground-strong text-sm">{user?.fullName}</p>
                  <p className="text-muted">{user?.email}</p>
                  {user?.matricNumber && <p className="text-muted">Matric: {user.matricNumber}</p>}
                </div>
                <div className="sm:text-right">
                  <p className="font-semibold text-muted uppercase tracking-wider">Payment Details</p>
                  <p className="mt-1 text-foreground-strong">
                    Date: <span className="font-medium">{fmtDateTime(selectedReceipt.paidAt || selectedReceipt.createdAt)}</span>
                  </p>
                  <p className="text-foreground-strong">
                    Status: <span className="font-bold text-success capitalize">{selectedReceipt.status}</span>
                  </p>
                  <p className="text-foreground-strong">
                    Method: <span className="capitalize">{selectedReceipt.provider || 'Paystack'}</span>
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-surface-strong text-xs font-bold uppercase tracking-wider text-muted">
                    <tr>
                      <th className="p-3 pl-4">Description</th>
                      <th className="p-3 text-right pr-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-3 pl-4 font-medium text-foreground-strong">
                        {selectedReceipt.planName || 'TestFlow Plus Pass'} (30 Days)
                        <p className="text-xs font-normal text-muted">Ad-free study, Live CBT, early AI access &amp; custom CBT</p>
                      </td>
                      <td className="p-3 text-right pr-4 font-semibold text-foreground-strong">
                        {formatMoney(selectedReceipt.amountKobo, selectedReceipt.currency)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="border-t border-border bg-surface font-bold text-foreground-strong">
                    <tr>
                      <td className="p-3 pl-4 text-right">Total Paid:</td>
                      <td className="p-3 text-right pr-4 text-primary text-base">
                        {formatMoney(selectedReceipt.amountKobo, selectedReceipt.currency)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Footer Note */}
              <p className="mt-5 text-center text-xs text-muted">
                Thank you for studying with TestFlow. For support or queries, contact hello@testflow.com.ng.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyRef(selectedReceipt.reference)}
                leadingIcon={copied ? <Check size={14} /> : <Copy size={14} />}
              >
                {copied ? 'Copied' : 'Copy Reference'}
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(null)}>
                  Close
                </Button>
                <Button variant="primary" size="sm" onClick={handlePrint} leadingIcon={<Printer size={14} />}>
                  Print Receipt
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </Screen>
  );
}

export default InvoicesPage;
