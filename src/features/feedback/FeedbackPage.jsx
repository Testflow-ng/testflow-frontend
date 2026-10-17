import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  CharacterCounter,
  EmptyState,
  Field,
  Input,
  SegmentedControl,
  Spinner,
  StarRating,
  StatusBadge,
  Textarea,
  useToast,
} from '../../components/ui/index.js';
import { sheetClasses } from '../../components/ui/surfaces.js';
import { PageHeader, Screen } from '../../components/layout/Screen.jsx';
import { cn } from '../../utils/cn.js';
import { FEEDBACK_KINDS, feedbackKind, ratingLabel } from './kinds.js';
import { useFeedback, useSubmitFeedback } from './useFeedback.js';

const MIN_LENGTH = 10;
const MAX_LENGTH = 1000;
const MAX_SCREEN = 80;

const formatWhen = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

/**
 * Feedback, and the problems students run into.
 *
 * Two halves of one screen on purpose. The form is where a student says what is wrong .stars
 * for the trend, a kind so it is triaged as the right job, and a message .and the list below
 * is where they can see that it went somewhere and what came back. Feedback with no visible
 * destination reads as a void; the status and the reply are what make sending it worth doing.
 *
 * The stars are optional: a bug report should never be blocked on rating the product.
 */
function FeedbackPage() {
  const toast = useToast();
  const { data: entries, isLoading, isError, error } = useFeedback();
  const submit = useSubmitFeedback();

  const [kind, setKind] = useState(FEEDBACK_KINDS[0].id);
  const [rating, setRating] = useState(0);
  const [screen, setScreen] = useState('');
  const [message, setMessage] = useState('');

  const trimmed = message.trim();
  const ready = trimmed.length >= MIN_LENGTH;
  const active = feedbackKind(kind);

  const send = (event) => {
    event.preventDefault();
    if (!ready || submit.isPending) return;
    submit.mutate(
      { kind, rating: rating || null, screen: screen.trim() || null, message: trimmed },
      {
        onSuccess: () => {
          toast.success('Thank you', 'Everything sent here is read by the team.');
          setMessage('');
          setRating(0);
          setScreen('');
        },
        onError: (err) => toast.error('That did not send', err?.message ?? 'Please try again.'),
      },
    );
  };

  return (
    <Screen width="md">
      <PageHeader
        back="/settings"
        title="Feedback"
        subtitle="Something broken, or something we should build? This goes straight to the team."
      />

      <form onSubmit={send} className={sheetClasses({ className: 'mt-6 p-5' })}>
        <div>
          <p className="text-sm font-medium text-foreground-strong">How is TestFlow treating you?</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <StarRating value={rating} onValueChange={setRating} label="Your rating" name="feedback-rating" />
            <span className={cn('text-sm font-semibold', rating ? 'text-foreground-strong' : 'text-muted')}>
              {rating ? ratingLabel(rating) : 'Tap a star'}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-muted">
            Optional. The stars are how we tell whether things are getting better.
          </p>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-foreground-strong">What is this about?</p>
          <div className="mt-2">
            <SegmentedControl
              fullWidth
              label="What is this about?"
              value={kind}
              onValueChange={setKind}
              options={FEEDBACK_KINDS.map((item) => ({ value: item.id, label: item.short }))}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted">{active.hint}</p>
        </div>

        <Field
          className="mt-5"
          label="Where did you see it?"
          hint="Optional. “The exam timer”, “Library reader”, “Live CBT”."
        >
          <Input
            value={screen}
            maxLength={MAX_SCREEN}
            placeholder="A screen on TestFlow"
            onChange={(event) => setScreen(event.target.value)}
          />
        </Field>

        <Field className="mt-5" label="Your message" required>
          <Textarea
            rows={5}
            value={message}
            maxLength={MAX_LENGTH}
            placeholder="Tell us what happened, and what you expected instead."
            onChange={(event) => setMessage(event.target.value)}
          />
        </Field>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted">
            {ready ? 'Bugs with steps to reproduce get fixed fastest.' : `At least ${MIN_LENGTH} characters, so we can act on it.`}
          </span>
          <CharacterCounter value={message} max={MAX_LENGTH} />
        </div>

        <Button
          type="submit"
          className="mt-5 w-full sm:w-auto"
          loading={submit.isPending}
          disabled={!ready}
        >
          Send feedback
        </Button>
      </form>

      <section className="mt-8">
        <div className="mb-2 flex items-center justify-between gap-3 px-1">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Your feedback</h2>
          {entries?.length ? (
            <span className="text-xs text-muted">
              {entries.length} sent
            </span>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size={24} label="Loading your feedback" />
          </div>
        ) : isError ? (
          <Alert variant="danger">{error?.message ?? 'Your feedback could not be loaded.'}</Alert>
        ) : !entries?.length ? (
          <EmptyState
            icon={MessageSquare}
            title="Nothing sent yet"
            description="When something goes wrong, or when you think TestFlow could do better, send it above. The answer shows up here."
          />
        ) : (
          <ol className="flex flex-col gap-3">
            {entries.map((entry) => {
              const kindCfg = feedbackKind(entry.kind);
              return (
                <li key={entry.id} className={sheetClasses({ className: 'p-5' })}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={kindCfg.variant}>{kindCfg.label}</Badge>
                    <StatusBadge status={entry.status} />
                    {entry.rating ? <StarRating value={entry.rating} readOnly size={14} /> : null}
                    <span className="text-xs text-muted">{formatWhen(entry.createdAt)}</span>
                  </div>

                  <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-foreground-strong">
                    {entry.message}
                  </p>

                  {entry.screen ? (
                    <p className="mt-2 text-xs text-muted">On: {entry.screen}</p>
                  ) : null}

                  {entry.reply ? (
                    <div className="mt-3 rounded-[16px] border border-border bg-surface-strong/40 p-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                        TestFlow replied
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-foreground-strong">{entry.reply}</p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </Screen>
  );
}

export default FeedbackPage;
