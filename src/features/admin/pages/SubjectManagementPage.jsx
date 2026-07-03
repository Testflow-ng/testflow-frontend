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
  Alert
} from '../../../components/ui/index.js';
import { Plus, Edit2, Trash2, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subjectSchema } from '../schemas.js';

function SubjectManagementPage() {
  const queryClient = useQueryClient();
  const [editingSubject, setEditingSubject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectsApi.list,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subjectSchema),
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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {subjects?.map((s) => (
            <Card key={s.id} className="p-5 flex justify-between items-center">
              <div className="min-w-0">
                <p className="font-mono text-xs font-medium text-muted">{s.code}</p>
                <h3 className="truncate font-semibold text-foreground-strong">{s.title}</h3>
                {!s.isActive && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-danger/10 text-danger mt-1 inline-block">
                    Inactive
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <IconButton
                  icon={<Edit2 className="w-4 h-4" />}
                  variant="ghost"
                  aria-label="Edit"
                  onClick={() => handleEdit(s)}
                />
                <IconButton
                  icon={<Trash2 className="w-4 h-4 text-danger" />}
                  variant="ghost"
                  aria-label="Delete"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${s.code}?`)) {
                      deleteMutation.mutate(s.id);
                    }
                  }}
                />
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

          <Field label="Subject Code" error={errors.code?.message}>
            <Input placeholder="e.g. MTH101" {...register('code')} />
          </Field>

          <Field label="Subject Title" error={errors.title?.message}>
            <Input placeholder="e.g. Introduction to Mathematics" {...register('title')} />
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
