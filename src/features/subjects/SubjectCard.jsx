import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { cn } from '../../utils/cn.js';
import { subjectMeta } from './subjectMeta.js';

function SubjectCard({ subject, onStart, isStarting }) {
  const { Icon, accent } = subjectMeta(subject.code);
  const count = subject.questionCount ?? 0;
  const disabled = count === 0;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', accent)}>
          <Icon size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-xs font-medium text-muted">{subject.code}</p>
          <h3 className="text-sm font-semibold text-foreground-strong">{subject.title}</h3>
          <p className="mt-0.5 text-xs text-muted">
            {count} {count === 1 ? 'question' : 'questions'}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant={disabled ? 'outline' : 'primary'}
        fullWidth
        disabled={disabled}
        loading={isStarting}
        onClick={() => onStart(subject.code)}
      >
        {disabled ? 'No questions yet' : 'Start practice'}
      </Button>
    </Card>
  );
}

export default SubjectCard;
