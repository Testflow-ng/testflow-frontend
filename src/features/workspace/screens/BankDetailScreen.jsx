import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileUp, ImageIcon, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, ConfirmDialog, DropdownMenu, EmptyState, IconButton, SearchField, SkeletonCard, useToast } from '../../../components/ui/index.js';
import DataTable from '../../../components/data/DataTable.jsx';
import MathText from '../../../components/MathText.jsx';
import Screen from '../../../components/layout/Screen.jsx';
import { ICON } from '../../../components/ui/iconProps.js';
import { wsApi } from '../api.js';
import { useOrg } from '../OrgContext.js';
import { ImportModal, QuestionModal } from '../QuestionModals.jsx';
import { BLANK_QUESTION } from '../questionDefaults.js';
import { useBankQuestions, useQuestionBanks, useWsMutation } from '../useWorkspace.js';

const PAGE = 12;

/** One question bank: add questions to it, edit them, delete them. */
function BankDetailScreen() {
  const { bankId } = useParams();
  const toast = useToast();
  const { orgId } = useOrg();
  const { data: banks, isLoading } = useQuestionBanks();
  const bank = banks?.find((b) => b.id === bankId);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data } = useBankQuestions(bankId, { page, limit: PAGE, search: search || undefined });
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  const [removing, setRemoving] = useState(null);
  const del = useWsMutation((id, qid) => wsApi.deleteQuestion(id, qid), { onSuccess: () => toast.success('Question deleted') });

  if (isLoading) return <Screen width="full"><SkeletonCard className="mt-8 h-64" /></Screen>;
  if (!bank) return <Screen width="md"><EmptyState icon={ArrowLeft} title="Question bank not found" description="It may have been deleted." action={<Link to="/workspace/banks"><Button>Back to question banks</Button></Link>} /></Screen>;

  const columns = [
    { key: 'stem', header: 'Question', render: (q) => <span className="flex items-center gap-2 text-foreground-strong"><span className="line-clamp-2 max-w-[34rem]"><MathText>{q.stem}</MathText></span>{q.stemImageUrl && <ImageIcon size={14} className="shrink-0 text-muted" aria-label="Has a picture" />}</span> },
    { key: 'topic', header: 'Topic', render: (q) => (q.topic ? <Badge variant="lavender">{q.topic}</Badge> : <span className="text-muted">-</span>) },
    { key: 'difficulty', header: 'Level', render: (q) => <Badge variant={{ easy: 'success', medium: 'warning', hard: 'danger' }[q.difficulty] ?? 'outline'}>{q.difficulty}</Badge> },
  ];

  return (
    <Screen width="full">
      <Link to="/workspace/banks" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><ArrowLeft {...ICON} size={15} /> All question banks</Link>
      <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-[1.75rem] font-extrabold leading-tight tracking-tight text-foreground-strong">{bank.name}</h1>
          <p className="mt-1 text-sm text-muted">{bank.description || `${bank.questionCount ?? 0} questions. Pick this bank when you build an exam.`}</p>
        </div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => setImporting(true)} leadingIcon={<FileUp {...ICON} size={15} />}>Import a file</Button><Button onClick={() => setEditing(BLANK_QUESTION)} leadingIcon={<Plus {...ICON} size={15} />}>Write a question</Button></div>
      </header>

      <div className="mt-8 space-y-4">
        <SearchField className="max-w-sm" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} onClear={() => setSearch('')} placeholder="Search this bank" />
        {data && data.total === 0 && !search ? (
          <EmptyState mood="encouraging" title="This bank is empty" description="Write a question, or import a whole file of them." action={<Button onClick={() => setEditing(BLANK_QUESTION)}>Write a question</Button>} />
        ) : (
          <DataTable caption="Questions" columns={columns} rows={(data?.items ?? []).map((q) => ({ ...q, id: q.id }))} emptyMessage="No questions match."
            server={{ page: data?.page ?? page, pageCount: data?.pages ?? Math.max(1, Math.ceil((data?.total ?? 0) / PAGE)), total: data?.total ?? 0, onPageChange: setPage, sort: null, onSortChange: () => {} }}
            rowActions={(q) => <DropdownMenu placement="bottom-end" trigger={(p) => <IconButton aria-label="Question actions" size="sm" variant="ghost" {...p}><MoreHorizontal size={16} /></IconButton>} items={[{ label: 'Edit', icon: Pencil, onSelect: () => setEditing({ ...BLANK_QUESTION, ...q, options: [...q.options], optionImages: q.optionImages ?? [] }) }, { separator: true }, { label: 'Delete', icon: Trash2, danger: true, onSelect: () => setRemoving(q) }]} />} />
        )}
      </div>

      {editing && <QuestionModal key={editing.id ?? 'new'} initial={editing} orgId={orgId} bankId={bankId} onClose={() => setEditing(null)} />}
      <ImportModal open={importing} onOpenChange={setImporting} bankId={bankId} />
      <ConfirmDialog open={Boolean(removing)} onOpenChange={(o) => !o && setRemoving(null)} tone="danger" title="Delete this question?" description="It is removed from this bank and any exam that used it." confirmLabel="Delete" onConfirm={() => del.mutateAsync(removing.id)} />
    </Screen>
  );
}

export default BankDetailScreen;
