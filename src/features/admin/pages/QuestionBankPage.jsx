import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { adminApi } from '../api.js';
import { subjectsApi } from '../../subjects/api.js';
import {
  Button,
  Input,
  Card,
  Spinner,
  IconButton,
  Field
} from '../../../components/ui/index.js';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import BulkImportModal from '../components/BulkImportModal.jsx';

function QuestionBankPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectsApi.list,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['questions', { page, search, subject }],
    queryFn: () => adminApi.listQuestions({ page, search, subject, limit: 10 }),
    placeholderData: keepPreviousData,
  });

  const questions = data?.items || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground-strong">Question Bank</h1>
          <p className="text-muted text-sm">Manage and organize exam questions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leadingIcon={<Upload className="w-4 h-4" />} onClick={() => setIsImportModalOpen(true)}>
            Import
          </Button>
          <Link to="/admin/questions/new">
            <Button leadingIcon={<Plus className="w-4 h-4" />}>
              Add Question
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-4 mb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Search Questions">
            <Input
              placeholder="Search by text..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leadingAdornment={<Search className="w-4 h-4 text-muted" />}
            />
          </Field>
          <Field label="Filter by Subject">
            <select
              className="w-full h-11 rounded-md border border-border bg-surface px-3 text-sm text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Subjects</option>
              {subjects?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.title}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <Card className="p-12 text-center text-danger">
          Failed to load questions. Please try again.
        </Card>
      ) : questions.length === 0 ? (
        <Card className="p-12 text-center text-muted">
          No questions found matching your criteria.
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <Card key={q.id} className="p-5">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      {q.subject?.code}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-strong text-muted">
                      {q.type}
                    </span>
                  </div>
                  <p className="text-foreground-strong font-medium line-clamp-2 mb-2">
                    {q.stem}
                  </p>
                  <p className="text-xs text-muted">
                    {q.options?.length} options • Correct: {q.options?.[q.correctIndex] || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/admin/questions/${q.id}/edit`}>
                    <button
                      className="p-2.5 rounded-xl bg-surface-strong text-primary hover:bg-primary hover:text-white transition-all shadow-sm border border-border"
                      title="Edit Question"
                    >
                      <Edit2 size={16} />
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this question?')) {
                        adminApi.deleteQuestion(q.id).then(() => {
                           window.location.reload();
                        });
                      }
                    }}
                    className="p-2.5 rounded-xl bg-surface-strong text-danger hover:bg-danger hover:text-white transition-all shadow-sm border border-border"
                    title="Delete Question"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                leadingIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <span className="text-sm text-muted">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                trailingIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      <BulkImportModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
      />
    </div>
  );
}

export default QuestionBankPage;
