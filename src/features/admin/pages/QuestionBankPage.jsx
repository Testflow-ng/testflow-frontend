import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { adminApi } from '../api.js';
import { subjectsApi } from '../../subjects/api.js';
import {
  Button,
  Input,
  Card,
  Spinner,
  Field,
  Badge
} from '../../../components/ui/index.js';
import MathText from '../../../components/MathText.jsx';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, Upload, Filter, CheckSquare, Square, X, Check, Share2, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import BulkImportModal from '../components/BulkImportModal.jsx';
import QuestionAnalyticsModal from '../components/QuestionAnalyticsModal.jsx';
import { cn } from '../../../utils/cn.js';
import { motion, AnimatePresence } from 'framer-motion';

function QuestionBankPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [analyticsQuestionId, setAnalyticsQuestionId] = useState(null);

  const queryClient = useQueryClient();

  const { data: subjects } = useQuery({
    queryKey: ['subjects', { all: true }],
    queryFn: () => subjectsApi.list({ all: true }),
  });

  const filteredSubjectsForSelect = useMemo(() => {
    if (!subjects) return [];
    if (level === 'all') return subjects;
    return subjects.filter(s => s.level === level);
  }, [subjects, level]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['questions', { page, search, subject, level }],
    queryFn: () => adminApi.listQuestions({ page, search, subject, level: level !== 'all' ? level : undefined, limit: 10 }),
    placeholderData: keepPreviousData,
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => adminApi.bulkDeleteQuestions(ids),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['questions']);
      setSelectedIds([]);
      alert(res.message);
    }
  });

  const bulkToggleMutation = useMutation({
    mutationFn: ({ ids, isActive }) => adminApi.bulkToggleQuestions(ids, isActive),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['questions']);
      setSelectedIds([]);
      alert(res.message);
    }
  });

  const questions = data?.items || [];
  const totalPages = data?.pages || 1;

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === questions.length && questions.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map(q => q.id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} questions?`)) {
      bulkDeleteMutation.mutate(selectedIds);
    }
  };

  const handleBulkToggle = (isActive) => {
    bulkToggleMutation.mutate({ ids: selectedIds, isActive });
  };

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
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Search Questions" className="sm:col-span-1">
            <Input
              placeholder="Search text..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leadingAdornment={<Search className="w-4 h-4 text-muted" />}
            />
          </Field>

          <Field label="Filter Level">
            <select
              className="w-full h-11 rounded-md border border-border bg-surface px-3 text-sm text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                setSubject(''); // Reset subject when level changes
                setPage(1);
              }}
            >
                <option value="all">All Levels</option>
                <option value="post-utme">Post-UTME</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
            </select>
          </Field>

          <Field label="Filter Subject">
            <select
              className="w-full h-11 rounded-md border border-border bg-surface px-3 text-sm text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{level === 'all' ? 'All Subjects' : `All ${level.toUpperCase()} Subjects`}</option>
              {filteredSubjectsForSelect?.map((s) => (
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
          <div className="flex items-center justify-between px-2 mb-2">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted hover:text-foreground-strong transition-colors"
            >
              {selectedIds.length === questions.length && questions.length > 0 ? (
                <CheckSquare size={16} className="text-primary" />
              ) : (
                <Square size={16} />
              )}
              {selectedIds.length > 0 ? `Selected ${selectedIds.length}` : 'Select All on Page'}
            </button>
            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="text-[10px] font-black uppercase tracking-widest text-danger hover:underline"
              >
                Clear Selection
              </button>
            )}
          </div>

          {questions.map((q) => (
            <Card
              key={q.id}
              className={cn(
                "p-5 transition-all",
                selectedIds.includes(q.id) ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:border-primary/20"
              )}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleSelect(q.id)}
                  className={cn(
                    "mt-1 shrink-0 transition-colors",
                    selectedIds.includes(q.id) ? "text-primary" : "text-muted hover:text-foreground"
                  )}
                >
                  {selectedIds.includes(q.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      {q.subject?.code}
                    </span>
                    <Badge variant={q.subject?.level === 'post-utme' ? 'warning' : 'info'} className="text-[8px] px-1.5 py-0">
                        {q.subject?.level?.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-strong text-muted">
                      {q.difficulty}
                    </span>
                    {!q.isActive && (
                      <Badge variant="danger" className="text-[8px] px-1.5 py-0">INACTIVE</Badge>
                    )}
                    {q.topic && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">
                        {q.topic}
                      </span>
                    )}
                    {q.isShareable && (
                      <Badge variant="success" className="text-[8px] px-1.5 py-0">PUBLIC</Badge>
                    )}
                  </div>
                  <MathText className="text-foreground-strong font-medium line-clamp-2 mb-2">
                    {q.stem}
                  </MathText>
                  <div className="text-xs text-muted flex flex-wrap gap-x-3 gap-y-1">
                    <span>{q.options?.length} options</span>
                    <span className="flex items-center gap-1">
                      Correct: <MathText className="inline-block">{q.options?.[q.correctIndex] || 'N/A'}</MathText>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {q.isShareable && (
                    <>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/api/public/questions/${q.id}/share`;
                          navigator.clipboard.writeText(url);
                          alert('Public share link copied to clipboard!');
                        }}
                        className="p-2.5 rounded-xl bg-surface-strong text-primary hover:bg-primary hover:text-white transition-all border border-border"
                        title="Copy Share Link"
                      >
                        <Share2 size={16} />
                      </button>
                      <button
                        onClick={() => setAnalyticsQuestionId(q.id)}
                        className="p-2.5 rounded-xl bg-surface-strong text-info hover:bg-info hover:text-white transition-all border border-border"
                        title="View Public Analytics"
                      >
                        <BarChart3 size={16} />
                      </button>
                    </>
                  )}
                  <Link to={`/admin/questions/${q.id}/edit`}>
                    <button
                      className="p-2.5 rounded-xl bg-surface-strong text-foreground hover:bg-primary hover:text-white transition-all border border-border"
                      title="Edit Question"
                    >
                      <Edit2 size={16} />
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this question?')) {
                        adminApi.deleteQuestion(q.id).then(() => {
                           queryClient.invalidateQueries(['questions']);
                        });
                      }
                    }}
                    className="p-2.5 rounded-xl bg-surface-strong text-foreground hover:bg-danger hover:text-white transition-all border border-border"
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

      <QuestionAnalyticsModal
        questionId={analyticsQuestionId}
        onOpenChange={(open) => !open && setAnalyticsQuestionId(null)}
      />

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
          >
            <div className="bg-foreground-strong text-background rounded-2xl p-4 shadow-2xl shadow-black/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  <CheckSquare size={20} />
                </div>
                <div className="min-w-[100px]">
                  <p className="text-sm font-black">{selectedIds.length} Selected</p>
                  <p className="text-[10px] font-bold text-background/60 uppercase tracking-widest">Bulk Actions</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-background/10 text-background hover:bg-background/20 border-none"
                  onClick={() => handleBulkToggle(true)}
                  loading={bulkToggleMutation.isPending}
                >
                  Enable
                </Button>
                <Button
                  size="sm"
                  className="bg-background/10 text-background hover:bg-background/20 border-none"
                  onClick={() => handleBulkToggle(false)}
                  loading={bulkToggleMutation.isPending}
                >
                  Disable
                </Button>
                <div className="w-px h-8 bg-background/10 mx-1" />
                <Button
                  size="sm"
                  variant="danger"
                  className="shadow-lg shadow-danger/20"
                  onClick={handleBulkDelete}
                  loading={bulkDeleteMutation.isPending}
                  leadingIcon={<Trash2 size={14} />}
                >
                  Delete
                </Button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="ml-2 p-1 hover:bg-background/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default QuestionBankPage;
