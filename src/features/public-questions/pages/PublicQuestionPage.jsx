import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  CheckCircle2,
  XCircle,
  Share2,
  ArrowRight,
  Target,
  HelpCircle,
  Trophy,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Alert, Spinner } from '../../../components/ui/index.js';
import PageLoader from '../../../components/PageLoader.jsx';
import MathText from '../../../components/MathText.jsx';
import Confetti from '../../../components/brand/Confetti.jsx';
import { cn } from '../../../utils/cn.js';
import apiClient from '../../../api/client.js';

const letter = (index) => String.fromCharCode(65 + index);

function PublicQuestionPage() {
  const { id } = useParams();
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch question
  const { data: question, isLoading, isError } = useQuery({
    queryKey: ['publicQuestion', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/public/questions/${id}`);
      return res.data.question;
    },
    retry: false
  });

  // Submit response
  const mutation = useMutation({
    mutationFn: async (optionIndex) => {
      const res = await apiClient.post(`/api/public/questions/${id}/respond`, {
        selectedOption: optionIndex
      });
      return res.data;
    },
    onSuccess: (data) => {
      setResult(data);
    }
  });

  const handleShare = () => {
    const url = `${window.location.origin}/api/public/questions/${id}/share`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <PageLoader label="Loading Challenge..." />;

  if (isError) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <div className="mb-6 flex justify-center">
            <div className="size-16 rounded-full bg-danger/10 text-danger flex items-center justify-center">
                <XCircle size={32} />
            </div>
        </div>
        <h2 className="text-xl font-bold text-foreground-strong">Question Not Found</h2>
        <p className="text-sm text-muted mt-2">This link may have expired or the question was removed.</p>
        <Button as={Link} to="/" className="mt-8 w-full">Back to Home</Button>
      </div>
    );
  }

  const isAnswered = result !== null;

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 lg:py-20">
      <Confetti active={result?.isCorrect} />

      <header className="mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary mb-4"
        >
          <Sparkles size={12} className="fill-current" />
          TestFlow Challenge
        </motion.div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground-strong lg:text-4xl">
          Quick Practice
        </h1>
        <p className="mt-2 text-sm text-muted">
          From {question.subject?.title || 'General Knowledge'} ({question.subject?.code || 'GEN'})
        </p>
      </header>

      <Card className="p-6 md:p-8 border-border/50 shadow-xl shadow-black/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <HelpCircle size={80} />
        </div>

        <div className="relative">
            <MathText className="text-lg md:text-xl font-bold leading-relaxed text-foreground-strong mb-8">
                {question.stem}
            </MathText>

            <div className="space-y-3">
                {question.options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrect = isAnswered && index === result.correctIndex;
                    const isWrong = isAnswered && isSelected && !result.isCorrect;

                    return (
                        <button
                            key={index}
                            disabled={isAnswered || mutation.isPending}
                            onClick={() => setSelectedOption(index)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group",
                                !isAnswered && isSelected ? "border-primary bg-primary/5" : "border-border bg-surface",
                                !isAnswered && !isSelected && "hover:border-border-strong active:scale-[0.98]",
                                isCorrect && "border-success bg-success/5",
                                isWrong && "border-danger bg-danger/5"
                            )}
                        >
                            <span className={cn(
                                "size-8 shrink-0 rounded-lg border flex items-center justify-center text-xs font-black transition-colors",
                                isSelected && !isAnswered ? "bg-primary border-primary text-white" : "border-border text-muted group-hover:border-border-strong",
                                isCorrect && "bg-success border-success text-white",
                                isWrong && "bg-danger border-danger text-white"
                            )}>
                                {letter(index)}
                            </span>
                            <MathText className={cn(
                                "flex-1 text-sm font-bold leading-relaxed",
                                isSelected ? "text-foreground-strong" : "text-muted hover:text-foreground-strong"
                            )}>
                                {option}
                            </MathText>
                            <AnimatePresence>
                                {isCorrect && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-success shrink-0">
                                        <CheckCircle2 size={20} />
                                    </motion.div>
                                )}
                                {isWrong && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-danger shrink-0">
                                        <XCircle size={20} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    );
                })}
            </div>

            {!isAnswered ? (
                <Button
                    fullWidth
                    size="lg"
                    disabled={selectedOption === null || mutation.isPending}
                    loading={mutation.isPending}
                    onClick={() => mutation.mutate(selectedOption)}
                    className="mt-8 h-14 rounded-2xl shadow-xl shadow-primary/20 text-base font-black"
                    leadingIcon={<Target size={20} />}
                >
                    Submit Answer
                </Button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 space-y-6"
                >
                    {result.explanation && (
                        <div className="p-5 rounded-2xl bg-surface-strong border border-border">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5">
                                <Sparkles size={12} className="fill-current" />
                                Solution
                            </h4>
                            <MathText className="text-sm leading-relaxed text-muted font-medium italic">
                                {result.explanation}
                            </MathText>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            as={Link}
                            to="/register"
                            className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/20"
                            leadingIcon={<Trophy size={18} />}
                        >
                            Try Full Mock Exam
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleShare}
                            className="flex-1 h-12 rounded-xl"
                            leadingIcon={<Share2 size={18} />}
                        >
                            {copied ? 'Link Copied!' : 'Challenge a Friend'}
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
      </Card>

      <footer className="mt-12 text-center">
         <Link to="/" className="text-xs font-bold text-muted hover:text-primary transition-colors flex items-center justify-center gap-1.5 uppercase tracking-widest">
            Powered by TestFlow <ArrowRight size={12} />
         </Link>
      </footer>
    </div>
  );
}

export default PublicQuestionPage;
