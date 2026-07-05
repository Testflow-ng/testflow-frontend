import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { Alert, Button } from '../../components/ui/index.js';
import PageLoader from '../../components/PageLoader.jsx';
import MathText from '../../components/MathText.jsx';
import { cn } from '../../utils/cn.js';
import { examApi } from './api.js';

const letter = (index) => String.fromCharCode(65 + index);

const scoreTone = (score) => {
  if (score >= 70) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-danger';
};

function ExamResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['examResult', id],
    queryFn: () => examApi.result(id),
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <PageLoader label="Scoring your exam" />;
  }
  if (isError) {
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-10">
        <Alert variant="danger">{error?.message ?? 'These results could not be loaded.'}</Alert>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-5 py-8">
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <p className="font-mono text-xs font-medium text-muted">{result.subjectCode}</p>
        <p className={cn('mt-2 text-5xl font-bold tabular-nums', scoreTone(result.score))}>
          {result.score}%
        </p>
        <p className="mt-1 text-sm text-muted">
          {result.correctCount} of {result.totalQuestions} correct
        </p>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-foreground-strong">Review answers</h2>
      <ol className="mt-4 flex flex-col gap-4">
        {result.questions.map((question) => (
          <li key={question.index} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <MathText className="text-sm font-medium text-foreground-strong">
                {question.index + 1}. {question.stem}
              </MathText>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                  question.isCorrect ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
                )}
              >
                {question.isCorrect
                  ? 'Correct'
                  : question.selectedOption === null
                    ? 'Skipped'
                    : 'Wrong'}
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {question.options.map((option, index) => {
                const isCorrect = index === question.correctOption;
                const isChosen = index === question.selectedOption;
                return (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md border p-2.5 text-sm',
                      isCorrect
                        ? 'border-success/40 bg-success/10 text-success'
                        : isChosen
                          ? 'border-danger/40 bg-danger/10 text-danger'
                          : 'border-border text-foreground',
                    )}
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-semibold">
                      {letter(index)}
                    </span>
                    <MathText>{option}</MathText>
                    {isCorrect ? (
                      <Check size={15} className="ml-auto shrink-0" aria-label="Correct answer" />
                    ) : isChosen ? (
                      <X size={15} className="ml-auto shrink-0" aria-label="Your answer" />
                    ) : null}
                  </div>
                );
              })}
            </div>

            {question.explanation ? (
              <div className="mt-3 rounded-md bg-surface-strong p-3 text-xs leading-relaxed text-muted">
                <span className="font-semibold text-foreground-strong">Explanation. </span>
                <MathText className="inline">{question.explanation}</MathText>
              </div>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}

export default ExamResultPage;
