import { motion, AnimatePresence } from 'framer-motion';
import { Lock, MessageCircle, Copy, CheckCircle2, ShieldCheck, Zap, Upload, FileImage, X, Check } from 'lucide-react';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Alert, Spinner } from '../../../components/ui/index.js';
import { useAuth } from '../../auth/useAuth.js';
import { cn } from '../../../utils/cn.js';
import apiClient from '../../../api/client.js';
import CryptoJS from 'crypto-js';

function PostUtmeLockScreen({ config }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const { data: statusData, isLoading: isStatusLoading } = useQuery({
    queryKey: ['verificationStatus'],
    queryFn: async () => {
      const res = await apiClient.get('/api/verifications/my-status');
      return res.data;
    }
  });

  const getIKAuth = async () => {
    const res = await apiClient.get('/api/verifications/auth');
    return res.data;
  };

  const getFileHash = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const words = CryptoJS.lib.WordArray.create(e.target.result);
        const hash = CryptoJS.MD5(words).toString();
        resolve(hash);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) return;

      // 1. Get Auth Parameters
      const auth = await getIKAuth();

      // 2. Calculate Hash
      const hash = await getFileHash(file);

      // 3. Upload to ImageKit
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', `receipt-${user.id}-${Date.now()}`);
      formData.append('folder', '/receipts');
      formData.append('publicKey', auth.publicKey);
      formData.append('signature', auth.signature);
      formData.append('expire', auth.expire);
      formData.append('token', auth.token);

      const ikResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!ikResponse.ok) {
        const errorData = await ikResponse.json();
        throw new Error(errorData.message || 'ImageKit upload failed');
      }

      const ikData = await ikResponse.json();

      // 4. Submit to our Backend
      const res = await apiClient.post('/api/verifications/submit', {
        receiptImage: ikData.url,
        receiptHash: hash
      });

      return res.data;
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
    uploadMutation.mutate();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(user.verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAccount = () => {
    const acc = config?.paymentInfo?.accountNumber || '8147321034';
    navigator.clipboard.writeText(acc);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const request = statusData?.request;
  const isPending = user?.postUtmeStatus === 'pending' || request?.status === 'pending';

  const whatsappLink = `https://wa.me/2341234567890?text=Hello%20Testflow%20Admin,%20I%20have%20made%20payment%20for%20Post-UTME%20access.%20My%20verification%20code%20is:%20${user.verificationCode}`;

  if (isStatusLoading) return <div className="flex h-svh items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col px-5 py-10 lg:py-20">
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
          Join thousands of scholars preparing for Post-UTME. Get access to mocks, analytics, and calculators.
        </p>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Left Column: Instructions & Payment */}
        <div className="space-y-6">
           <Card raised className="p-8 border-primary/20 bg-gradient-to-br from-surface to-primary/5 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 size-40 bg-primary/10 rounded-full blur-3xl" />

              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary mb-6">
                <Zap size={14} className="fill-current" />
                One-time Access
              </div>

              <div className="flex items-baseline gap-2 mb-8">
                <h2 className="text-5xl font-black text-foreground-strong tracking-tighter">
                  ₦{config?.postUtmePrice || '2,000'}
                </h2>
                <span className="text-sm font-bold text-muted">/ session</span>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-white">
                    <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Check size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted">Step 1: Make Payment</p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                            <p className="text-sm font-black text-foreground-strong truncate">
                                {config?.paymentInfo?.bankName || 'Opay'} · {config?.paymentInfo?.accountNumber || '8147321034'}
                            </p>
                            <button
                                onClick={copyAccount}
                                className="flex items-center gap-1 text-[10px] font-black text-primary uppercase shrink-0"
                            >
                                <Copy size={10} /> {copiedAcc ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                        <p className="text-xs font-bold text-muted truncate">{config?.paymentInfo?.accountName || 'Oluwadare Daniel'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-white">
                    <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Check size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted">Step 2: Upload Receipt</p>
                        <p className="text-sm font-black text-foreground-strong">
                            Screenshot the image of your receipt and upload it here.
                        </p>
                    </div>
                </div>
              </div>
           </Card>

           <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-surface-strong border border-border">
                 <ShieldCheck size={20} className="text-primary mb-3" />
                 <h4 className="text-xs font-black text-foreground-strong uppercase tracking-tight">Verified Secure</h4>
                 <p className="text-[10px] text-muted mt-1 leading-relaxed">Direct human verification by the admin team.</p>
              </div>
              <div className="p-5 rounded-3xl bg-surface-strong border border-border">
                 <CheckCircle2 size={20} className="text-success mb-3" />
                 <h4 className="text-xs font-black text-foreground-strong uppercase tracking-tight">Instant Unlock</h4>
                 <p className="text-[10px] text-muted mt-1 leading-relaxed">Access granted immediately after receipt approval.</p>
              </div>
           </div>
        </div>

        {/* Right Column: Upload/Pending Area */}
        <div className="h-full">
          <Card className="p-8 h-full flex flex-col justify-center border-border/50 relative bg-surface overflow-hidden">
            {isPending ? (
              <div className="flex flex-col items-center text-center py-4">
                 <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-success animate-bounce">
                    <CheckCircle2 size={12} />
                    Uploaded
                 </div>
                 <div className="mb-8 relative">
                    <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
                    <div className="relative size-20 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                       <Clock size={40} strokeWidth={1.5} />
                    </div>
                 </div>
                 <h3 className="text-xl font-black text-foreground-strong">Verification in Progress</h3>
                 <p className="mt-4 text-sm text-muted leading-relaxed max-w-[260px]">
                    The Team is currently verifying your receipt. You will be redirected once your payment is confirmed.
                 </p>

                 <div className="mt-10 w-full space-y-4">
                    <div className="p-4 rounded-2xl bg-surface-strong border border-border flex items-center justify-between text-left">
                        <div>
                            <p className="text-[9px] font-black text-muted uppercase tracking-widest">Expected Time</p>
                            <p className="text-xs font-bold text-foreground-strong">15 mins — 24 hours</p>
                        </div>
                        <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
                    </div>
                    <Button
                        as="a"
                        href={whatsappLink}
                        target="_blank"
                        variant="ghost"
                        size="sm"
                        className="w-full text-[10px] font-black uppercase tracking-widest"
                    >
                        Expedite via WhatsApp
                    </Button>
                 </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-sm font-black uppercase tracking-widest text-foreground-strong">Submit Payment Proof</h3>
                   <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <ShieldCheck size={16} />
                   </div>
                </div>

                {!preview ? (
                  <div
                    onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
                    className={cn(
                        "flex-1 cursor-pointer flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-border bg-surface-strong transition-all p-10 group min-h-[300px]",
                        uploadMutation.isPending ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    <div className="size-16 rounded-[1.5rem] bg-surface border border-border flex items-center justify-center text-muted group-hover:text-primary transition-all group-hover:rotate-12 mb-4 shadow-sm">
                       <Upload size={32} />
                    </div>
                    <p className="text-sm font-black text-foreground-strong">Tap to upload receipt</p>
                    <p className="mt-2 text-[10px] text-muted text-center max-w-[180px] leading-relaxed uppercase tracking-tighter">
                        Please ensure the transfer details are clearly visible on the image.
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      disabled={uploadMutation.isPending}
                    />
                  </div>
                ) : (
                  <div className="flex-1 relative rounded-[2.5rem] overflow-hidden border border-border bg-black min-h-[300px] shadow-inner">
                     <img src={preview} alt="Receipt Preview" className="h-full w-full object-cover opacity-60" />
                     <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-t from-black/80 to-transparent backdrop-blur-[1px]">
                        <div className="size-12 rounded-full bg-white shadow-xl flex items-center justify-center text-primary mb-3">
                           <FileImage size={24} />
                        </div>
                        <p className="text-xs font-black text-white truncate max-w-full px-2 mb-6">{file.name}</p>
                        <button
                          onClick={() => { setFile(null); setPreview(null); }}
                          disabled={uploadMutation.isPending}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all bg-white/10 px-4 py-2 rounded-full border border-white/10"
                        >
                           <X size={14} /> Replace Image
                        </button>
                     </div>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!file || uploadMutation.isPending}
                  loading={uploadMutation.isPending}
                  variant="primary"
                  className="mt-8 w-full h-14 rounded-2xl shadow-2xl shadow-primary/30 text-base font-black"
                  leadingIcon={<CheckCircle2 size={24} />}
                >
                  {uploadMutation.isPending ? 'Uploading Receipt...' : 'Confirm Payment'}
                </Button>

                {uploadMutation.isError && (
                    <Alert variant="danger" className="mt-4 rounded-xl text-[10px] py-2">
                        {uploadMutation.error.message}
                    </Alert>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="mt-16 flex flex-wrap justify-center gap-3">
        {[
          '40-Question Mock Tests',
          'Admission Aggregate',
          'Subject Performance Radar',
          'Departmental Rankings',
          'Exam History',
          'Strict CBT Mode'
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border shadow-sm">
            <div className="size-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-bold text-foreground-strong uppercase tracking-tight">{item}</span>
          </div>
        ))}
      </div>

      <p className="mt-12 text-center text-[10px] font-bold text-muted uppercase tracking-[0.2em]">
        Verified by Team
      </p>
    </div>
  );
}

export default PostUtmeLockScreen;
