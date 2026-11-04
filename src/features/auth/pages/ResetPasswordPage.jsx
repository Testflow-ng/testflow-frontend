import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '../../../utils/zodResolver.js';
import { resetPasswordSchema } from '../schemas.js';
import { authApi } from '../api.js';
import AuthShell from '../ui/AuthShell.jsx';
import AuthField from '../ui/AuthField.jsx';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [formError, setFormError] = useState(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: '', confirmPassword: '' } });

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
      <AuthShell
        title="Invalid"
        accent="reset link."
        subtitle="This password reset link is missing or no longer valid."
        footer={<Link to="/forgot-password">Request a new link</Link>}
      >
        <p className="auth-alert auth-alert-danger" role="alert">
          Please request a new password reset link and try again.
        </p>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password" accent="updated." subtitle="Your password has been reset." footer={<Link to="/login">Sign in</Link>}>
        <p className="auth-alert auth-alert-success" role="status">
          You can now sign in with your new password.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new" accent="password." subtitle="Choose a strong password you’ll remember.">
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError && (
          <p className="auth-alert auth-alert-danger" role="alert">
            {formError}
          </p>
        )}
        <AuthField
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a new password"
          hint="8+ characters, a letter and a number."
          error={errors.password?.message}
          {...register('password')}
        />
        <AuthField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Enter it again"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Reset password'}
        </button>
      </form>
    </AuthShell>
  );
}

export default ResetPasswordPage;
