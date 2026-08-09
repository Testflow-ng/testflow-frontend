import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api.js';
import { subjectsApi } from '../../subjects/api.js';
import {
  Button,
  Input,
  Card,
  Spinner,
  IconButton,
  Field,
  Modal,
  Alert,
  Badge
} from '../../../components/ui/index.js';
import { Plus, Edit2, Trash2, ChevronLeft, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subjectSchema } from '../schemas.js';
import { cn } from '../../../utils/cn.js';

const LEVELS = [
  { value: 'post-utme', label: 'Post-UTME' },
  { value: '100', label: '100 Level' },
  { value: '200', label: '200 Level' },
  { value: '300', label: '300 Level' },
  { value: '400', label: '400 Level' },
  { value: '500', label: '500 Level' },
];

function SubjectManagementPage() {
  const queryClient = useQueryClient();
  const [editingSubject, setEditingSubject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects', { all: true }],
    queryFn: () => subjectsApi.list({ all: true }),
  });

  const filteredSubjects = subjects?.filter(s => {
    const matchesSearch = (s.code?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (s.title?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = levelFilter === 'all' || s.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      isActive: true,
      level: '100'
    }
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      editingSubject
        ? adminApi.updateSubject(editingSubject.id, data)
        : adminApi.createSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects']);
      setIsModalOpen(false);
      reset();
      setEditingSubject(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteSubject(id),
    onSuccess: () => queryClient.invalidateQueries(['subjects']),
  });

  const onSubmit = (data) => mutation.mutate(data);

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    reset({
      code: subject.code,
      title: subject.title,
      description: subject.description || '',
      level: subject.level || '100',
      department: subject.department || '',
      isActive: subject.isActive,
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSubject(null);
    reset({
      code: '',
      title: '',
      description: '',
      level: '100',
      department: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <IconButton icon={<ChevronLeft className="w-5 h-5" />} variant="ghost" aria-label="Back" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground-strong">Subjects</h1>
            <p className="text-muted text-sm">Manage examination subjects</p>
          </div>
        </div>
        <Button leadingIcon={<Plus className="w-4 h-4" />} onClick={handleAdd}>
          Add Subject
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Search Subjects">
            <Input
              placeholder="Search by code or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leadingAdornment={<Search size={16} />}
            />
          </Field>
          <Field label="Filter by Level">
            <div className="relative">
                <select
                className="w-full h-11 rounded-md border border-border bg-surface px-3 text-sm text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 appearance-none"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                >
                    <option value="all">All Levels</option>
                    {LEVELS.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                </select>
                <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>
          </Field>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredSubjects?.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-2xl border border-dashed border-border">
          <p className="text-muted">No subjects found.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredSubjects?.map((s) => (
            <Card key={s.id} className="p-5 flex justify-between items-center group hover:border-primary/30 transition-all">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1.5">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted">{s.code}</p>
                    <Badge variant={s.level === 'post-utme' ? 'warning' : 'info'} className="text-[8px] px-1.5 py-0">
                        {s.level?.toUpperCase()}
                    </Badge>
                </div>
                <h3 className="truncate font-bold text-foreground-strong tracking-tight">{s.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {s.department && (
                        <span className="text-[9px] font-bold text-muted-foreground bg-surface-strong px-2 py-0.5 rounded border border-border">
                            {s.department}
                        </span>
                    )}
                    {!s.isActive && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-danger/10 text-danger">
                        Hidden
                    </span>
                    )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(s)}
                  className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all shadow-md shadow-primary/10 border border-primary/20"
                  title="Edit Subject"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${s.code}?`)) {
                      deleteMutation.mutate(s.id);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-danger text-white hover:bg-danger/90 transition-all shadow-md shadow-danger/10 border border-danger/20"
                  title="Delete Subject"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingSubject ? 'Edit Subject' : 'New Subject'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {mutation.isError && (
            <Alert variant="danger">
              {mutation.error?.response?.data?.message || 'An error occurred.'}
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field
                label="Subject Code"
                error={errors.code?.message}
                hint={watch('level') === 'post-utme' ? "Optional for Post-UTME (will be auto-generated)" : "e.g. MTH101"}
            >
                <Input placeholder="e.g. MTH101" {...register('code')} />
            </Field>

            <Field label="Academic Level" error={errors.level?.message}>
                <select
                    className="w-full h-11 rounded-md border border-border bg-surface px-3 text-sm text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    {...register('level')}
                >
                    {LEVELS.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                </select>
            </Field>
          </div>

          <Field label="Subject Title" error={errors.title?.message}>
            <Input placeholder="e.g. Introduction to Mathematics" {...register('title')} />
          </Field>

          <Field label="Department (Optional)" error={errors.department?.message}>
            <Input placeholder="e.g. Computer Science" {...register('department')} />
          </Field>

          <Field label="Description (Optional)" error={errors.description?.message}>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-border bg-surface p-3 text-sm text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              placeholder="Brief description..."
              {...register('description')}
            />
          </Field>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" {...register('isActive')} />
            <label htmlFor="isActive" className="text-sm text-foreground-strong font-medium">
              Subject is active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={mutation.isPending} className="flex-1">
              {editingSubject ? 'Update' : 'Create'}
            </Button>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default SubjectManagementPage;
