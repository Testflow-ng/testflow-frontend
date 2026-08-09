import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Eye, ExternalLink, ShieldCheck, Mail, User as UserIcon, History, Clock, Search, Hash } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Card, Button, Badge, Modal, Spinner, Alert, Input, Field } from '../../../components/ui/index.js';
import PageLoader from '../../../components/PageLoader.jsx';
import { cn } from '../../../utils/cn.js';

function VerificationQueuePage() {
  const queryClient = useQueryClient();
  const [selectedReq, setSelectedReq] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['verificationQueue', activeTab],
    queryFn: async () => {
      const res = await fetch(`/api/verifications/queue?status=${activeTab === 'pending' ? 'pending' : 'all'}`);
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

  const requests = data?.requests || [];

  const filteredRequests = useMemo(() => {
    if (!searchTerm) return requests;
    return requests.filter(r =>
        r.student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.student.verificationCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.transactionRef?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [requests, searchTerm]);

  if (isLoading) return <PageLoader label="Fetching Verification Data" />;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="font-heading text-2xl font-black text-foreground-strong">Verification Management</h1>
          <p className="text-sm text-muted">Review, approve, and track student payment receipts.</p>
        </div>

        <div className="flex bg-surface-strong p-1 rounded-2xl border border-border self-start">
            <button
                onClick={() => setActiveTab('pending')}
                className={cn(
                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    activeTab === 'pending' ? "bg-white text-primary shadow-sm" : "text-muted hover:text-foreground-strong"
                )}
            >
                Pending
            </button>
            <button
                onClick={() => setActiveTab('history')}
                className={cn(
                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    activeTab === 'history' ? "bg-white text-primary shadow-sm" : "text-muted hover:text-foreground-strong"
                )}
            >
                History
            </button>
        </div>
      </div>

      <div className="mb-8">
         <div className="relative max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
                type="text"
                placeholder="Search by name, code or transaction ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 bg-surface border border-border rounded-2xl pl-11 pr-4 text-sm font-medium focus:border-primary outline-none transition-all"
            />
         </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-border bg-surface-strong">
           <ShieldCheck size={48} className="mx-auto text-muted/20 mb-4" />
           <h3 className="text-lg font-bold text-foreground-strong">
               {activeTab === 'pending' ? "Queue is Empty!" : "No History Found"}
           </h3>
           <p className="text-sm text-muted mt-1">
               {activeTab === 'pending' ? "You've cleared all pending verifications." : "No processed requests match your search."}
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <Card key={req.id} className={cn(
                "overflow-hidden border-border/50 group transition-all",
                req.status === 'approved' && "border-success/20 bg-success/[0.02]",
                req.status === 'rejected' && "border-danger/20 bg-danger/[0.02]"
            )}>
               <div className="relative h-48 bg-surface-strong overflow-hidden cursor-pointer" onClick={() => setSelectedReq(req)}>
                  <img
                    src={req.receiptImage}
                    alt="Receipt"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <div className="size-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                        <Eye size={20} />
                     </div>
                  </div>
                  {req.status !== 'pending' && (
                    <div className={cn(
                        "absolute top-3 right-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg",
                        req.status === 'approved' ? "bg-success" : "bg-danger"
                    )}>
                        {req.status}
                    </div>
                  )}
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
                     <Badge variant="outline" className="text-[9px] px-2 py-0 border-border">
                        {new Date(req.createdAt).toLocaleDateString()}
                     </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-muted mb-4">
                     <Hash size={12} />
                     <span className="font-mono">{req.transactionRef || 'NO_REF'}</span>
                  </div>

                  {req.status === 'pending' ? (
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
                  ) : (
                    <div className="pt-4 border-t border-border">
                         <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">
                            Processed {new Date(req.processedAt || req.updatedAt).toLocaleString()}
                         </p>
                         <Button
                            variant="outline"
                            fullWidth
                            size="sm"
                            className="rounded-xl text-[10px] h-8"
                            onClick={() => setSelectedReq(req)}
                         >
                            View Details
                         </Button>
                    </div>
                  )}
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
             <div className="rounded-2xl overflow-hidden border border-border bg-black aspect-[4/3] flex items-center justify-center relative">
                <img
                  src={selectedReq.receiptImage}
                  alt="Full Receipt"
                  className="max-h-full max-w-full object-contain"
                />
                <a
                    href={selectedReq.receiptImage}
                    target="_blank"
                    className="absolute bottom-4 right-4 size-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-all"
                >
                    <ExternalLink size={20} />
                </a>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-surface-strong border border-border">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Student Details</p>
                   <p className="text-sm font-black text-foreground-strong">{selectedReq.student.fullName}</p>
                   <p className="text-xs font-bold text-muted mt-1">{selectedReq.student.verificationCode}</p>
                </div>
                <div className="p-4 rounded-2xl bg-surface-strong border border-border">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Transaction Ref</p>
                   <p className="text-sm font-black text-foreground-strong font-mono uppercase truncate">{selectedReq.transactionRef || 'No Reference'}</p>
                   <p className="text-xs font-bold text-muted mt-1">{new Date(selectedReq.createdAt).toLocaleString()}</p>
                </div>
             </div>

             {selectedReq.status === 'pending' ? (
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
             ) : (
                <div className={cn(
                    "p-6 rounded-2xl border text-center",
                    selectedReq.status === 'approved' ? "bg-success/5 border-success/20 text-success" : "bg-danger/5 border-danger/20 text-danger"
                )}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                        {selectedReq.status === 'approved' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
                        <h4 className="text-lg font-black uppercase tracking-tight">Payment {selectedReq.status}</h4>
                    </div>
                    <p className="text-xs font-bold opacity-70">
                        This request was processed on {new Date(selectedReq.processedAt).toLocaleString()}
                    </p>
                </div>
             )}
          </div>
        )}
      </Modal>
    </div>
  );
}

const AlertCircle = ({ size, className }) => <X size={size} className={className} />;

export default VerificationQueuePage;
