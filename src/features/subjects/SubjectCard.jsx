import Card from '../../components/ui/Card.jsx';
import { cn } from '../../utils/cn.js';
import { subjectMeta } from './subjectMeta.js';

function SubjectCard({ subject }) {
  const { Icon, accent } = subjectMeta(subject.code);
  const count = subject.questionCount ?? 0;

  return (
    <Card className="flex items-start gap-3">
      <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', accent)}>
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-xs font-medium text-muted">{subject.code}</p>
        <h3 className="truncate text-sm font-semibold text-foreground-strong">{subject.title}</h3>
        <p className="mt-0.5 text-xs text-muted">
          {count} {count === 1 ? 'question' : 'questions'}
        </p>
      </div>
    </Card>
  );
}

export default SubjectCard;
