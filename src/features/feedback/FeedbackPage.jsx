import { useState } from 'react';
import { Bug, Lightbulb, MapPin, MessageSquare, Send, Sparkles } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
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

function FeedbackPage() {
  const toast = useToast();
  const { data: entries, isLoading, isError, error } = useFeedback();
  const submit = useSubmitFeedback();

  const [activeTab, setActiveTab] = useState('compose');
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
          toast.success('Thank you!', 'Everything sent here is read directly by the team.');
          setMessage('');
          setRating(0);
          setScreen('');
          setActiveTab('history');
        },
        onError: (err) => toast.error('Could not send feedback', err?.message ?? 'Please try again.'),
      },
    );
  };

  const hasHistory = Boolean(entries && entries.length > 0);

  return (
    <Screen width="md">
      <PageHeader
        back="/settings"
        eyebrow="Support"
        title="Send feedback"
        subtitle="Found a bug, want a new feature, or have a suggestion? We read every message."
      />

      {hasHistory && (
        <div className="mt-5">
          <SegmentedControl
            fullWidth
            value={activeTab}
            onValueChange={setActiveTab}
            options={[
              { value: 'compose', label: 'Send new feedback' },
              { value: 'history', label: `My feedback (${entries.length})` },
            ]}
          />
        </div>
      )}

      {/* Form Tab */}
      {(!hasHistory || activeTab === 'compose') && (
        <Card padding="lg" className="mt-6 space-y-6">
          <form onSubmit={send} className="space-y-6">
            {/* Category Selector */}
            <div>
              <label className="text-sm font-semibold text-foreground-strong">What is this about?</label>
              <div className="mt-2.5 grid grid-cols-3 gap-2 sm:gap-2.5">
                {FEEDBACK_KINDS.map((item) => {
                  const isSelected = item.id === kind;
                  const Icon = item.id === 'problem' ? Bug : item.id === 'idea' ? Lightbulb : MessageSquare;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setKind(item.id)}
                      className={cn(
                        'tf-pressable flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        isSelected
                          ? item.id === 'problem'
                            ? 'border-danger/40 bg-danger/[0.08] text-danger font-bold ring-1 ring-danger/30'
                            : item.id === 'idea'
                            ? 'border-primary/40 bg-[var(--brand-lavender)] text-primary font-bold ring-1 ring-primary/30'
                            : 'border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary/30'
                          : 'border-border bg-surface text-muted hover:border-border-strong hover:bg-surface-strong hover:text-foreground-strong',
                      )}
                    >
                      <Icon size={19} className={isSelected ? 'scale-110 transition-transform' : 'text-muted'} />
                      <span className="text-xs font-semibold leading-tight">{item.short}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted leading-relaxed">{active.hint}</p>
            </div>

            {/* Experience Rating */}
            <div className="rounded-2xl border border-border bg-surface-strong/30 p-3.5 sm:p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground-strong">Overall rating</p>
                  <p className="text-xs text-muted">How has your experience with TestFlow been?</p>
                </div>
                <div className="flex items-center gap-2 pt-1 sm:pt-0">
                  <StarRating value={rating} onValueChange={setRating} label="Your rating" name="feedback-rating" size={24} />
                  <span className={cn('text-xs font-bold min-w-[50px]', rating ? 'text-foreground-strong' : 'text-muted')}>
                    {rating ? ratingLabel(rating) : 'Optional'}
                  </span>
                </div>
              </div>
            </div>

            {/* Location / Screen field */}
            <Field
              label="Where did this happen?"
              hint="Optional. e.g. CBT Exam timer, Library reader, Courses, Billing"
            >
              <Input
                value={screen}
                maxLength={MAX_SCREEN}
                placeholder="e.g. Exam timer, Library, Home screen"
                onChange={(event) => setScreen(event.target.value)}
              />
            </Field>

            {/* Message Area */}
            <div>
              <Field label="Your message" required>
                <Textarea
                  rows={4}
                  value={message}
                  maxLength={MAX_LENGTH}
                  placeholder={
                    kind === 'problem'
                      ? 'Tell us what happened, what you did, and what went wrong...'
                      : kind === 'idea'
                      ? "Describe the feature or improvement you'd love to see on TestFlow..."
                      : 'Share your thoughts, suggestions, or questions with the team...'
                  }
                  onChange={(event) => setMessage(event.target.value)}
                />
              </Field>
              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span>
                  {ready ? 'Clear details help us act on this quickly.' : `At least ${MIN_LENGTH} characters so we can understand.`}
                </span>
                <CharacterCounter value={message} max={MAX_LENGTH} />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto font-semibold"
              loading={submit.isPending}
              disabled={!ready}
              leadingIcon={<Send size={15} />}
            >
              Send feedback
            </Button>
          </form>
        </Card>
      )}

      {/* History Tab */}
      {(!hasHistory || activeTab === 'history') && (
        <section className={cn('space-y-4', !hasHistory ? 'mt-8' : 'mt-6')}>
          {!hasHistory && (
            <div className="mb-2 px-1">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Your feedback history</h2>
            </div>
          )}

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
              description="When something goes wrong, or when you think TestFlow could do better, send it above. The team's reply will show up here."
            />
          ) : (
            <ol className="flex flex-col gap-3.5">
              {entries.map((entry) => {
                const kindCfg = feedbackKind(entry.kind);
                const KindIcon = entry.kind === 'problem' ? Bug : entry.kind === 'idea' ? Lightbulb : MessageSquare;
                return (
                  <li key={entry.id}>
                    <Card padding="md" className="space-y-3.5">
                      {/* Top metadata */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                              entry.kind === 'problem'
                                ? 'bg-danger/10 text-danger border border-danger/20'
                                : entry.kind === 'idea'
                                ? 'bg-[var(--brand-lavender)] text-primary border border-primary/20'
                                : 'bg-surface-strong text-muted border border-border',
                            )}
                          >
                            <KindIcon size={12} aria-hidden="true" />
                            {kindCfg.label}
                          </span>
                          <StatusBadge status={entry.status} />
                          {entry.rating ? <StarRating value={entry.rating} readOnly size={13} /> : null}
                        </div>
                        <span className="text-xs text-muted">{formatWhen(entry.createdAt)}</span>
                      </div>

                      {/* User message */}
                      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground-strong">
                        {entry.message}
                      </p>

                      {/* Screen reference */}
                      {entry.screen && (
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-surface-strong/60 px-2.5 py-1 text-xs text-muted">
                          <MapPin size={12} className="shrink-0 text-muted" aria-hidden="true" />
                          <span>
                            Seen on: <strong className="font-semibold text-foreground-strong">{entry.screen}</strong>
                          </span>
                        </div>
                      )}

                      {/* Team reply */}
                      {entry.reply && (
                        <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-3.5 sm:p-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                            <Sparkles size={13} aria-hidden="true" />
                            <span>TestFlow Team replied</span>
                          </div>
                          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground-strong">
                            {entry.reply}
                          </p>
                        </div>
                      )}
                    </Card>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      )}
    </Screen>
  );
}

export default FeedbackPage;
