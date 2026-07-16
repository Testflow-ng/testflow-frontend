import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api.js';
import { subjectsApi } from '../../subjects/api.js';
import { questionSchema } from '../schemas.js';
import {
  Button,
  Input,
  Card,
  Field,
  Spinner,
  IconButton,
  Alert,
} from '../../../components/ui/index.js';
import MathText from '../../../components/MathText.jsx';
import { ChevronLeft, Plus, Trash2, Save } from 'lucide-react';

function EditQuestionPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.list(),
  });

  const { data: question, isLoading: isLoadingQuestion } = useQuery({
    queryKey: ['questions', id],
    queryFn: () => adminApi.getQuestion(id),
    enabled: isEdit,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      subject: '',
      topicId: '',
      topic: '',
      stem: '',
      options: ['', ''],
      correctIndex: 0,
      explanation: '',
      difficulty: 'medium',
      isActive: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  useEffect(() => {
    if (question) {
      reset({
        subject: question.subject?.id || question.subject,
        topicId: question.topicId || '',
        topic: question.topic || '',
        stem: question.stem,
        options: question.options,
        correctIndex: question.correctIndex,
        explanation: question.explanation || '',
        difficulty: question.difficulty,
        isActive: question.isActive,
      });
    }
  }, [question, reset]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? adminApi.updateQuestion(id, data) : adminApi.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      navigate('/admin/questions');
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  if (isEdit && isLoadingQuestion) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-6">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/questions">
          <IconButton icon={<ChevronLeft className="w-5 h-5" />} variant="ghost" aria-label="Back" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground-strong">
          {isEdit ? 'Edit Question' : 'New Question'}
        </h1>
      </div>

      {mutation.isError && (
        <Alert variant="danger" className="mb-6">
          {mutation.error?.response?.data?.message || 'An error occurred while saving.'}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <Field label="Subject" error={errors.subject?.message}>
              <select
                className="w-full h-11 rounded-md border border-border bg-surface px-3 text-sm text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                {...register('subject')}
              >
                <option value="">Select a subject</option>
                {subjects?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.title}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Difficulty" error={errors.difficulty?.message}>
              <select
                className="w-full h-11 rounded-md border border-border bg-surface px-3 text-sm text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                {...register('difficulty')}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </Field>

            <Field label="Topic (e.g. Newton's Laws)" error={errors.topic?.message}>
              <Input placeholder="Newton's Laws" {...register('topic')} />
            </Field>

            <Field label="Question Text (Stem)" error={errors.stem?.message}>
              <textarea
                className="w-full min-h-[120px] rounded-md border border-border bg-surface p-3 text-sm text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                placeholder="Type the question here... Wrap formulas in \( \) or $ $."
                {...register('stem')}
              />
              <p className="mt-1.5 text-[10px] text-muted leading-tight italic">
                Tip: Use <strong>\( \Delta x \)</strong> for delta x, or <strong>$ E = mc^2 $</strong> for inline math.
              </p>
              {watch('stem') && (
                <div className="mt-3 p-4 rounded-xl bg-surface-strong border border-border">
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-success animate-pulse" />
                    Live Math Preview
                  </p>
                  <MathText className="text-sm font-medium leading-relaxed">{watch('stem')}</MathText>
                </div>
              )}
            </Field>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground-strong mb-4">Options</h2>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3">
                <div className="pt-3">
                  <input
                    type="radio"
                    value={index}
                    className="w-4 h-4 text-primary focus:ring-primary"
                    {...register('correctIndex')}
                  />
                </div>
                <div className="flex-1">
                  <Field error={errors.options?.[index]?.message}>
                    <Input
                      placeholder={`Option ${index + 1}`}
                      {...register(`options.${index}`)}
                    />
                  </Field>
                </div>
                {fields.length > 2 && (
                  <IconButton
                    icon={<Trash2 className="w-4 h-4 text-danger" />}
                    variant="ghost"
                    onClick={() => remove(index)}
                    aria-label="Remove option"
                  />
                )}
              </div>
            ))}

            {fields.length < 6 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => append('')}
                leadingIcon={<Plus className="w-4 h-4" />}
              >
                Add Option
              </Button>
            )}

            {errors.correctIndex && (
              <p className="text-xs text-danger">{errors.correctIndex.message}</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <Field label="Explanation (Optional)" error={errors.explanation?.message}>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-border bg-surface p-3 text-sm text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              placeholder="Explain the correct answer..."
              {...register('explanation')}
            />
          </Field>
        </Card>

        <div className="flex items-center gap-4">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            leadingIcon={<Save className="w-4 h-4" />}
            className="flex-1"
          >
            {isEdit ? 'Update Question' : 'Create Question'}
          </Button>
          <Link to="/admin/questions" className="flex-1">
            <Button variant="outline" className="w-full" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default EditQuestionPage;
