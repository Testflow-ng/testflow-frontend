import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, Button, Field, Input } from '../../../components/ui/index.js';
import { zodResolver } from '../../../utils/zodResolver.js';
import { authApi } from '../api.js';
import { useAuth } from '../useAuth.js';

const setupSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'At least 3 characters')
    .max(20, 'At most 20 characters')
    .regex(/^[a-z0-9_]+$/, 'Only letters, numbers, and underscores'),
});

function SetupPage() {
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(setupSchema),
    defaultValues: { username: '' },
  });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await authApi.setUsername(values.username);
      await refreshUser();
      navigate('/dashboard');
    } catch (error) {
      if (error.code === 'USERNAME_TAKEN') {
        setError('username', { type: 'server', message: 'This username is already taken.' });
      } else {
        setFormError(error.message ?? 'Something went wrong. Please try again.');
      }
    }
  };

  const skip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-5">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            Almost there
          </p>
          <h1 className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-foreground-strong sm:text-3xl">
            Pick a username
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {user?.fullName ? `Welcome, ${user.fullName.split(' ')[0]}.` : 'Welcome.'}{' '}
            Choose a username so other students can find you.
          </p>
        </div>

        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {formError && <Alert variant="danger">{formError}</Alert>}
          <Field label="Username" error={errors.username?.message} required>
            <Input
              autoComplete="username"
              placeholder="e.g. feranmi_dev"
              {...register('username')}
            />
          </Field>
          <p className="-mt-2 text-[10px] text-muted">
            3-20 characters. Letters, numbers, and underscores only.
          </p>
          <Button
            type="submit"
            fullWidth
            loading={isSubmitting}
            className="mt-1 h-12 text-base"
          >
            Continue
          </Button>
        </form>

        <button
          type="button"
          onClick={skip}
          className="mt-4 w-full text-center text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

export default SetupPage;
