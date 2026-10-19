import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Modal, Radio, Textarea, useToast } from '../../components/ui/index.js';
import { flagQuestion } from './api.js';
import { FLAG_REASONS } from './flagReasons.js';

/**
 * Report a problem with a question.
 *
 * Opened from the paper while the question is on screen and from the corrections review after
 * it, because the two moments a student notices a broken question are "as I am answering it"
 * and "when I see the answer key".
 *
 * `question` only needs `{ id }`; everything else the admins see is read back from the bank.
 */
function ReportQuestionDialog({ open, onOpenChange, question }) {
  const toast = useToast();
  const [reason, setReason] = useState(FLAG_REASONS[0].id);
  const [note, setNote] = useState('');
  const [wasOpen, setWasOpen] = useState(open);

  const report = useMutation({
    mutationFn: () => flagQuestion(question.id, { reason, note: note.trim() }),
    onSuccess: () => {
      toast.success('Report sent', 'Thanks .an admin will review this question.');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Could not send that report', error?.message ?? 'Please try again.');
    },
  });

  /*
    Reset on open, during render rather than in an effect.

    Two reasons. An effect would paint the previous question's reason for a frame before
    correcting it, and a reason left over from the last question is a lie about this one.
    And this is the pattern React documents for adjusting state when a prop changes, so it
    does not cascade a render the way `setState` inside an effect does.
  */
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setReason(FLAG_REASONS[0].id);
      setNote('');
      report.reset();
    }
  }

  const needsNote = reason === 'other' && !note.trim();

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Report a question"
      description="Tell the admins what looks wrong. They see the reports and fix the bank."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={report.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => report.mutate()}
            disabled={report.isPending || needsNote}
            loading={report.isPending}
          >
            Send report
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5 py-1">
        {report.isError && (
          <Alert variant="danger">
            {report.error?.message ?? 'That report could not be sent.'}
          </Alert>
        )}

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-sm font-semibold text-foreground-strong">
            What is wrong with it?
          </legend>
          {FLAG_REASONS.map((option) => (
            <Radio
              key={option.id}
              name="flag-reason"
              value={option.id}
              label={option.label}
              hint={option.hint}
              checked={reason === option.id}
              onChange={() => setReason(option.id)}
            />
          ))}
        </fieldset>

        <div>
          <label
            htmlFor="flag-note"
            className="mb-1.5 block text-sm font-medium text-foreground-strong"
          >
            Anything to add?{' '}
            {reason !== 'other' ? (
              <span className="font-normal text-muted">(optional)</span>
            ) : (
              <span className="font-normal text-muted">(needed for “Something else”)</span>
            )}
          </label>
          <Textarea
            id="flag-note"
            rows={3}
            maxLength={500}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="The value of g used here is not the one the course uses."
          />
        </div>
      </div>
    </Modal>
  );
}

export default ReportQuestionDialog;
