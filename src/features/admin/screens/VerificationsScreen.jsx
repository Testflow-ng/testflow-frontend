import { useState } from 'react';
import { Check, ExternalLink, X } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Field, Modal, StatusBadge, Tabs, Textarea, useToast } from '../../../components/ui/index.js';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { adminApi } from '../api.js';
import { useAdminMutation, useVerifications } from '../useAdmin.js';
import { LoadError, TableSkeleton } from './shared.jsx';
import { timeAgo } from './format.js';

const TABS = [{ value: 'pending', label: 'Waiting' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }];

/** Post-UTME payment receipts a student uploaded. Approving unlocks their access. */
function VerificationsScreen() {
  const toast = useToast();
  const [status, setStatus] = useState('pending');
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const { data, isLoading, error } = useVerifications(status);

  const process = useAdminMutation(({ id, ...body }) => adminApi.processVerification(id, body), {
    onSuccess: (_r, v) => { toast.success(v.status === 'approved' ? 'Approved' : 'Rejected'); setRejecting(null); setReason(''); },
    onError: (e) => toast.error('Could not update', e.message),
  });

  return (
    <Screen width="xl">
      <PageHeader title="Verifications" subtitle="Payment receipts waiting for a decision." />
      <div className="mt-6"><Tabs idPrefix="verif" label="Status" items={TABS} value={status} onValueChange={setStatus} /></div>
      <div className="mt-6">
        {error ? <LoadError error={error} what="verifications" /> : isLoading ? <TableSkeleton rows={4} /> : !data?.length ? (
          <EmptyState mood="happy" title={status === 'pending' ? 'All clear' : 'Nothing here'} description={status === 'pending' ? 'No receipts are waiting.' : 'Decided requests show up here.'} />
        ) : (
          <ul className="space-y-4">
            {data.map((r) => (
              <li key={r.id ?? r._id}>
                <Card padding="lg" className="flex flex-wrap items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground-strong">{r.student?.fullName ?? 'A student'}</p>
                      <StatusBadge status={r.status === 'pending' ? 'pending' : r.status === 'approved' ? 'verified' : 'rejected'} label={r.status === 'pending' ? 'Waiting' : r.status === 'approved' ? 'Approved' : 'Rejected'} />
                    </div>
                    <p className="mt-1 text-sm text-muted">Code <Badge variant="outline" className="font-mono">{r.student?.verificationCode ?? '-'}</Badge> · Ref <span className="font-mono">{r.transactionRef ?? '-'}</span> · {timeAgo(r.createdAt)}</p>
                    {r.rejectionReason && <p className="mt-1 text-sm text-muted">Reason: {r.rejectionReason}</p>}
                  </div>
                  {r.receiptImage && <a href={r.receiptImage} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">View receipt <ExternalLink size={14} aria-hidden="true" /></a>}
                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" leadingIcon={<X size={14} />} onClick={() => setRejecting(r)}>Reject</Button>
                      <Button size="sm" loading={process.isPending && process.variables?.id === (r.id ?? r._id) && process.variables?.status === 'approved'} leadingIcon={<Check size={14} />} onClick={() => process.mutate({ id: r.id ?? r._id, status: 'approved' })}>Approve</Button>
                    </div>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Modal open={Boolean(rejecting)} onOpenChange={(o) => !o && setRejecting(null)} title="Reject this receipt" description="The student is told why."
        footer={<><Button variant="ghost" onClick={() => setRejecting(null)}>Cancel</Button><Button variant="danger" loading={process.isPending} disabled={reason.trim().length < 5} onClick={() => process.mutate({ id: rejecting.id ?? rejecting._id, status: 'rejected', rejectionReason: reason.trim() })}>Reject</Button></>}>
        <div className="py-1"><Field label="Reason" hint="At least 5 characters."><Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></Field></div>
      </Modal>
    </Screen>
  );
}

export default VerificationsScreen;
