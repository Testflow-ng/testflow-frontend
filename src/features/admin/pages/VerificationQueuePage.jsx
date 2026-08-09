import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Eye, ExternalLink, ShieldCheck, Mail, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { Card, Button, Badge, Modal, Spinner, Alert } from '../../../components/ui/index.js';
import PageLoader from '../../../components/PageLoader.jsx';
import { cn } from '../../../utils/cn.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function VerificationQueuePage() {
  const queryClient = useQueryClient();
  const [selectedReq, setSelectedReq] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['verificationQueue'],
    queryFn: async () => {
      const res = await fetch('/api/verifications/queue');
      if (!res.ok) throw new Error('Failed to load queue');
      return res.json();
    }
  });

  const processMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(`/api/verifications/${id}/process`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to process request');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['verificationQueue']);
      setSelectedReq(null);
    }
  });

  if (isLoading) return <PageLoader label="Fetching Pending Receipts" />;

  const requests = data?.requests || [];

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-black text-foreground-strong">Verification Queue</h1>
          <p className="text-sm text-muted">Review and approve Post-UTME payment receipts.</p>
        </div>
        <Badge variant="primary" className="h-7 px-3 rounded-full text-[10px] uppercase tracking-widest font-black">
          {requests.length} Pending
        </Badge>
      </div>

      {requests.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-border bg-surface-strong">
           <ShieldCheck size={48} className="mx-auto text-muted/20 mb-4" />
           <h3 className="text-lg font-bold text-foreground-strong">Clean Slate!</h3>
           <p className="text-sm text-muted mt-1">There are no pending verification requests at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <Card key={req.id} className="overflow-hidden border-border/50 group">
               <div className="relative h-48 bg-surface-strong overflow-hidden cursor-pointer" onClick={() => setSelectedReq(req)}>
                  <img
                    src={`${API_URL}${req.receiptImage}`}
                    alt="Receipt"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <div className="size-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                        <Eye size={20} />
                     </div>
                  </div>
               </div>

               <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                     <div>
                        <h4 className="text-sm font-black text-foreground-strong truncate max-w-[150px]">{req.student.fullName}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-bold text-muted uppercase tracking-tighter">
                           <UserIcon size={10} />
                           {req.student.verificationCode}
                        </div>
                     </div>
                     <Badge variant="outline" className="text-[9px] px-2 py-0">Pending</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-muted mb-6">
                     <Mail size={12} />
                     {req.student.email}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
                     <Button
                        onClick={() => processMutation.mutate({ id: req.id, status: 'rejected' })}
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-danger hover:bg-danger/5"
                     >
                        Reject
                     </Button>
                     <Button
                        onClick={() => processMutation.mutate({ id: req.id, status: 'approved' })}
                        variant="primary"
                        size="sm"
                        className="rounded-xl shadow-lg shadow-primary/20"
                     >
                        Approve
                     </Button>
                  </div>
               </div>
            </Card>
          ))}
        </div>
      )}

      {/* Full Preview Modal */}
      <Modal
        open={!!selectedReq}
        onOpenChange={() => setSelectedReq(null)}
        title="Review Receipt"
        size="lg"
      >
        {selectedReq && (
          <div className="space-y-6 pt-2">
             <div className="rounded-2xl overflow-hidden border border-border bg-black aspect-[4/3] flex items-center justify-center">
                <img
                  src={`${API_URL}${selectedReq.receiptImage}`}
                  alt="Full Receipt"
                  className="max-h-full max-w-full object-contain"
                />
             </div>

             <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-strong border border-border">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Student Code</p>
                   <p className="text-lg font-black text-foreground-strong tracking-widest font-mono">{selectedReq.student.verificationCode}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Upload Date</p>
                   <p className="text-xs font-bold text-foreground-strong">{new Date(selectedReq.createdAt).toLocaleString()}</p>
                </div>
             </div>

             <div className="flex gap-3">
                <Button
                  onClick={() => processMutation.mutate({ id: selectedReq.id, status: 'rejected' })}
                  variant="outline"
                  className="flex-1 rounded-2xl border-danger text-danger hover:bg-danger/5"
                  leadingIcon={<X size={18} />}
                >
                  Reject Proof
                </Button>
                <Button
                  onClick={() => processMutation.mutate({ id: selectedReq.id, status: 'approved' })}
                  className="flex-1 rounded-2xl shadow-xl shadow-primary/20"
                  leadingIcon={<Check size={18} />}
                >
                  Approve Payment
                </Button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default VerificationQueuePage;
