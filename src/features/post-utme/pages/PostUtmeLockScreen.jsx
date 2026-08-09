import { motion } from 'framer-motion';
import { Lock, MessageCircle, Copy, CheckCircle2, ShieldCheck, Zap, Upload, FileImage, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Alert, Spinner } from '../../../components/ui/index.js';
import { useAuth } from '../../auth/useAuth.js';
import { cn } from '../../../utils/cn.js';

function PostUtmeLockScreen({ config }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const { data: statusData, isLoading: isStatusLoading } = useQuery({
    queryKey: ['verificationStatus'],
    queryFn: async () => {
      const res = await fetch('/api/verifications/my-status');
      return res.json();
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch('/api/verifications/submit', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Upload failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['verificationStatus']);
      setFile(null);
      setPreview(null);
    }
  });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('receipt', file);
    uploadMutation.mutate(formData);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(user.verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const request = statusData?.request;
  const isPending = request?.status === 'pending';

  const whatsappLink = `https://wa.me/2341234567890?text=Hello%20Testflow%20Admin,%20I%20have%20made%20payment%20for%20Post-UTME%20access.%20My%20verification%20code%20is:%20${user.verificationCode}`;

  if (isStatusLoading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-5 py-10 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
          <Lock size={40} strokeWidth={1.5} />
        </div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground-strong lg:text-4xl">
          Unlock Post-UTME Excellence
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted max-w-md">
          Get access to full-length OAU mock tests, the aggregate calculator, and subject-specific analytics.
        </p>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Payment Card */}
        <Card raised className="p-6 border-primary/20 bg-gradient-to-br from-surface to-primary/5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary mb-4">
            <Zap size={14} className="fill-current" />
            One-time Access
          </div>
          <h2 className="text-4xl font-black text-foreground-strong mb-2">
            ₦{config?.postUtmePrice || '2,000'}
          </h2>
          <p className="text-xs text-muted mb-6">Lifetime access for this session</p>

          <div className="space-y-4 rounded-2xl bg-surface/50 p-4 border border-border/50">
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">Bank Name</p>
              <p className="text-sm font-bold text-foreground-strong">{config?.paymentInfo?.bankName || 'Test Bank'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">Account Number</p>
              <p className="text-sm font-bold text-foreground-strong tracking-wider">{config?.paymentInfo?.accountNumber || '1234567890'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">Account Name</p>
              <p className="text-sm font-bold text-foreground-strong">{config?.paymentInfo?.accountName || 'Testflow Admin'}</p>
            </div>
          </div>
        </Card>

        {/* Verification Card */}
        <Card className="p-6 flex flex-col justify-between overflow-hidden relative">
          {isPending ? (
            <div className="flex flex-col items-center text-center py-4">
               <div className="mb-6 relative">
                  <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
                  <div className="relative size-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                     <Clock size={32} />
                  </div>
               </div>
               <h3 className="text-lg font-black text-foreground-strong">Verification Pending</h3>
               <p className="mt-2 text-sm text-muted leading-relaxed">
                  We've received your receipt. Our admins are currently cross-referencing it with our bank statements.
               </p>
               <div className="mt-8 w-full rounded-2xl bg-surface-strong p-4 border border-border">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-tighter mb-1">Queue Status</p>
                  <p className="text-xs font-bold text-foreground-strong">Verification typically takes from a few minutes to a few hours.</p>
               </div>
               <Button
                as="a"
                href={whatsappLink}
                target="_blank"
                variant="ghost"
                className="mt-6 w-full text-xs font-bold"
               >
                Need help? WhatsApp Us
               </Button>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
                    <ShieldCheck size={14} />
                    Submit Proof
                 </div>
                 {user.verificationCode && (
                    <button onClick={copyCode} className="text-[10px] font-black text-primary uppercase">
                      Code: {user.verificationCode} {copied ? '✓' : ''}
                    </button>
                 )}
              </div>

              {!preview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface-strong transition-all hover:border-primary/50 hover:bg-primary/5 p-6 group"
                >
                  <div className="size-12 rounded-xl bg-surface border border-border flex items-center justify-center text-muted group-hover:text-primary transition-colors mb-3">
                     <Upload size={24} />
                  </div>
                  <p className="text-xs font-bold text-foreground-strong">Upload Receipt Image</p>
                  <p className="mt-1 text-[10px] text-muted">PNG or JPG, Max 5MB</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex-1 relative rounded-2xl overflow-hidden border border-border bg-surface-strong">
                   <img src={preview} alt="Receipt Preview" className="h-full w-full object-cover opacity-50" />
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <div className="size-10 rounded-full bg-white shadow-lg flex items-center justify-center text-primary mb-2">
                         <FileImage size={20} />
                      </div>
                      <p className="text-xs font-black text-foreground-strong truncate max-w-full px-2">{file.name}</p>
                      <button
                        onClick={() => { setFile(null); setPreview(null); }}
                        className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-danger bg-danger/10 px-3 py-1.5 rounded-full"
                      >
                         <X size={12} /> Remove
                      </button>
                   </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!file}
                loading={uploadMutation.isPending}
                variant="primary"
                className="mt-6 w-full h-12 rounded-2xl shadow-xl shadow-primary/20"
                leadingIcon={<CheckCircle2 size={20} />}
              >
                Submit for Verification
              </Button>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-12 flex flex-col gap-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted text-center">What you get</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            '40-Question Mock Tests',
            'Admission Probability',
            'Integrated Calculator',
            'Subject Analytics',
            'Departmental Cut-offs',
            'Strict Mode CBT'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
              <div className="size-2 rounded-full bg-primary" />
              <span className="text-xs font-bold text-foreground-strong">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <Alert variant="info" className="mt-12 rounded-2xl">
        <p className="text-xs font-medium leading-relaxed text-blue-800 dark:text-blue-200">
          Verification typically takes from a few minutes to a few hours. You will receive a notification and a welcome tour once your account is activated.
        </p>
      </Alert>
    </div>
  );
}

export default PostUtmeLockScreen;
