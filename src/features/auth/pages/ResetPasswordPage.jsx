import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Alert, Button, Field, PasswordInput } from '../../../components/ui/index.js';
import { zodResolver } from '../../../utils/zodResolver.js';
import { resetPasswordSchema } from '../schemas.js';
import { authApi } from '../api.js';
import AuthScreen from '../AuthScreen.jsx';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [formError, setFormError] = useState(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async ({ password }) => {
    setFormError(null);
    try {
      await authApi.resetPassword({ token, password });
      setDone(true);
    } catch (error) {
      setFormError(error.message ?? 'This reset link is invalid or has expired.');
    }
  };

  if (!token) {
    return (
      <AuthScreen
        title="Invalid link"
        footer={
          <Link className="font-semibold text-primary hover:underline" to="/forgot-password">
            Request a new link
          </Link>
        }
      >
        <Alert variant="danger">
          This password reset link is missing or invalid. Please request a new one.
        </Alert>
      </AuthScreen>
    );
  }

  if (done) {
    return (
      <AuthScreen
        title="Password updated"
        footer={
          <Link className="font-semibold text-primary hover:underline" to="/login">
            Sign in
          </Link>
        }
      >
        <Alert variant="success">
          Your password has been reset. You can now sign in with your new password.
        </Alert>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title="Set a new password" subtitle="Choose a strong password you'll remember">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError ? <Alert variant="danger">{formError}</Alert> : null}
        <Field
          label="New password"
          error={errors.password?.message}
          required
        >
          <PasswordInput
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            {...register('password')}
          />
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword?.message} required>
          <PasswordInput
            autoComplete="new-password"
            placeholder="Re-enter new password"
            {...register('confirmPassword')}
          />
        </Field>
        <p className="-mt-2 text-[10px] text-muted">
          Use at least 8 characters, including a letter and a number.
        </p>
        <Button type="submit" fullWidth loading={isSubmitting} className="mt-1 h-12 text-base">
          Reset password
        </Button>
      </form>
    </AuthScreen>
  );
}

export default ResetPasswordPage;
