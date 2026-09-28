import { useState, useMemo } from 'react';
import {
  Lightbulb,
  ChevronLeft,
  Send,
  Sparkles,
  History,
  MessageSquare,
  Bot,
  PlusCircle,
  FileCode,
  CheckCircle2,
  Share2,
  Copy,
  Layout,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card, Field, Input, Spinner, Badge, Alert } from '../../../components/ui/index.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionSchema } from '../schemas.js';
import { adminApi } from '../api.js';
import { subjectsApi } from '../../subjects/api.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MathText from '../../../components/MathText.jsx';
import { cn } from '../../../utils/cn.js';

function AdminBrainstormPage() {
  const [activeTab, setActiveTab] = useState('manual'); // 'ai' | 'manual' | 'json'
  const [publishedLink, setPublishedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.list(),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      subject: '',
      stem: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
      difficulty: 'medium',
      isActive: true,
      isShareable: true,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: 'options',
  });

  const mutation = useMutation({
    mutationFn: (data) => adminApi.createQuestion(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['questions']);
      const shareUrl = `${window.location.origin}/api/public/questions/${data.id}/share`;
      setPublishedLink(shareUrl);
      reset();
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publishedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8">
      <div className="flex items-center gap-4 mb-10">
        <Link to="/admin">
          <Button variant="ghost" size="sm" className="rounded-full p-2 h-10 w-10">
            <ChevronLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong sm:text-3xl flex items-center gap-3">
            <Sparkles size={28} className="text-primary" />
            Public Challenge Hub
          </h1>
          <p className="mt-1 text-sm text-muted">
            Create standalone questions and share them to your audience.
          </p>
        </div>
      </div>

      {publishedLink ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-10 text-center border-success/20 bg-success/5 mb-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <CheckCircle2 size={120} />
             </div>
             <div className="size-20 rounded-full bg-success text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-success/20">
                <Share2 size={40} />
             </div>
             <h2 className="text-2xl font-black text-foreground-strong uppercase tracking-tight">Question Published!</h2>
             <p className="text-sm text-muted mt-2 max-w-md mx-auto">Your question is now live and ready to be shared with students on WhatsApp and other platforms.</p>

             <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="w-full max-w-md bg-white border border-border rounded-xl px-4 py-3 text-sm font-mono truncate text-muted select-all">
                    {publishedLink}
                </div>
                <Button onClick={handleCopyLink} leadingIcon={copied ? <Check size={18} /> : <Copy size={18} />}>
                    {copied ? 'Copied!' : 'Copy Link'}
                </Button>
             </div>

             <button
                onClick={() => setPublishedLink(null)}
                className="mt-10 text-[10px] font-black uppercase tracking-widest text-muted hover:text-primary transition-colors"
             >
                Create Another Question
             </button>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex bg-surface-strong p-1 rounded-2xl border border-border w-fit">
               <button
                  onClick={() => setActiveTab('manual')}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    activeTab === 'manual' ? "bg-white text-primary shadow-sm" : "text-muted hover:text-foreground"
                  )}
               >
                  <PlusCircle size={14} /> Manual
               </button>
               <button
                  onClick={() => setActiveTab('ai')}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    activeTab === 'ai' ? "bg-white text-primary shadow-sm" : "text-muted hover:text-foreground"
                  )}
               >
                  <Bot size={14} /> AI Assist
               </button>
               <button
                  onClick={() => setActiveTab('json')}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    activeTab === 'json' ? "bg-white text-primary shadow-sm" : "text-muted hover:text-foreground"
                  )}
               >
                  <FileCode size={14} /> JSON
               </button>
            </div>

            <Card className="p-8">
              {activeTab === 'manual' && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Subject" error={errors.subject?.message}>
                      <select
                        className="w-full h-11 rounded-xl border border-border bg-surface px-3 text-sm font-bold text-foreground-strong focus:border-primary outline-none"
                        {...register('subject')}
                      >
                        <option value="">Choose a subject</option>
                        {subjects?.map((s) => (
                          <option key={s.id} value={s.id}>{s.code} - {s.title}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Difficulty">
                       <select
                        className="w-full h-11 rounded-xl border border-border bg-surface px-3 text-sm font-bold text-foreground-strong focus:border-primary outline-none"
                        {...register('difficulty')}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="Question Text (Stem)" error={errors.stem?.message}>
                    <textarea
                      placeholder="e.g. Solve for x: \( 2x + 4 = 10 \)"
                      className="w-full min-h-[120px] rounded-2xl border-2 border-border bg-surface p-5 text-sm font-medium focus:border-primary outline-none transition-all resize-none"
                      {...register('stem')}
                    />
                    {watch('stem') && (
                      <div className="mt-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-2">Math Preview</p>
                        <MathText className="text-sm font-medium leading-relaxed">{watch('stem')}</MathText>
                      </div>
                    )}
                  </Field>

                  <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-widest text-muted">Options & Correct Answer</p>
                    <div className="grid grid-cols-1 gap-3">
                      {fields.map((field, index) => (
                        <div key={field.id} className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                            watch('correctIndex') === index ? "border-success bg-success/5" : "border-border bg-surface"
                        )}>
                           <input
                              type="radio"
                              value={index}
                              checked={watch('correctIndex') === index}
                              onChange={() => setValue('correctIndex', index)}
                              className="size-5 text-success focus:ring-success"
                           />
                           <span className="text-xs font-black text-muted">{letter(index)}</span>
                           <input
                              placeholder={`Option ${letter(index)}`}
                              className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-foreground-strong"
                              {...register(`options.${index}`)}
                           />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Field label="Solution/Explanation (Optional)">
                    <textarea
                      placeholder="Explain the steps to the correct answer..."
                      className="w-full min-h-[100px] rounded-2xl border-2 border-border bg-surface p-5 text-sm font-medium focus:border-primary outline-none transition-all resize-none"
                      {...register('explanation')}
                    />
                  </Field>

                  <div className="pt-4">
                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={isSubmitting}
                        className="h-14 rounded-2xl shadow-xl shadow-primary/20 text-base font-black"
                        leadingIcon={<Send size={20} />}
                    >
                        Publish & Generate Link
                    </Button>
                  </div>
                </form>
              )}

              {activeTab === 'ai' && (
                <div className="text-center py-20">
                    <div className="size-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
                        <Sparkles size={32} />
                    </div>
                    <h3 className="text-lg font-black text-foreground-strong uppercase tracking-tight">AI Generation coming soon</h3>
                    <p className="text-sm text-muted mt-2 max-w-xs mx-auto">We are integrating Gemini Pro to help you brainstorm world-class questions instantly.</p>
                </div>
              )}

              {activeTab === 'json' && (
                <div className="space-y-6">
                    <Alert variant="info">
                        Paste a single question JSON object below. It will populate the form for review.
                    </Alert>
                    <textarea
                      placeholder='{ "stem": "...", "options": [...], "correctIndex": 0 }'
                      className="w-full min-h-[300px] rounded-2xl border-2 border-border bg-surface-strong p-5 text-xs font-mono outline-none focus:border-primary transition-all resize-none"
                    />
                    <Button fullWidth disabled variant="outline">Load from JSON</Button>
                </div>
              )}
            </Card>
          </div>

          <aside className="space-y-6">
            <div className="flex items-center justify-between px-1">
               <h3 className="text-xs font-black uppercase tracking-widest text-muted">Preview</h3>
               <Layout size={14} className="text-muted" />
            </div>

            <Card className="p-6 border-dashed border-border/50 bg-surface-strong/50">
               <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-4 opacity-50">Social Card Preview</p>
               <div className="rounded-xl overflow-hidden bg-white border border-border shadow-sm">
                  <div className="h-32 bg-primary/10 flex items-center justify-center">
                     <Logo size={40} withWordmark={false} />
                  </div>
                  <div className="p-4">
                     <p className="text-xs font-bold text-foreground-strong line-clamp-1">{watch('shareTitle') || 'TestFlow Question Challenge'}</p>
                     <p className="text-[10px] text-muted line-clamp-2 mt-1">{watch('stem') || 'Can you solve this challenge?'}</p>
                     <p className="text-[8px] font-bold text-primary mt-2 uppercase tracking-tighter">testflow.com.ng</p>
                  </div>
               </div>
            </Card>

            <Card className="p-6 bg-foreground text-background border-none overflow-hidden relative">
               <div className="absolute -right-6 -bottom-6 size-24 bg-primary/20 rounded-full blur-2xl" />
               <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Sharing Tip</h3>
               <p className="text-xs leading-relaxed font-bold">
                  Questions marked as shareable will also appear in the public discovery feed.
               </p>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}

function Logo({ size }) {
  return (
    <div style={{ width: size, height: size }} className="bg-primary rounded-xl flex items-center justify-center text-white font-black italic">
        TF
    </div>
  );
}

export default AdminBrainstormPage;
