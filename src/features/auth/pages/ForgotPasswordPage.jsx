import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '../../../utils/zodResolver.js';
import { forgotPasswordSchema } from '../schemas.js';
import { authApi } from '../api.js';
import AuthShell from '../ui/AuthShell.jsx';
import AuthField from '../ui/AuthField.jsx';

function ForgotPasswordPage() {
  const [formError, setFormError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await authApi.forgotPassword(values);
      setSubmitted(true);
    } catch (error) {
      setFormError(error.message ?? 'Something went wrong. Please try again.');
    }
  };

  const back = <Link to="/login">Back to sign in</Link>;

  if (submitted) {
    return (
      <AuthShell title="Check your" accent="email." subtitle="We’ve sent reset instructions if an account exists for that email." footer={back}>
        <p className="auth-alert auth-alert-success" role="status">
          Check your inbox for the reset link. If you don’t see it, check your spam or junk folder.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your"
      accent="password?"
      subtitle="Enter the email linked to your account and we’ll send you a reset link."
      footer={back}
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError && (
          <p className="auth-alert auth-alert-danger" role="alert">
            {formError}
          </p>
        )}
        <AuthField
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </AuthShell>
  );
}

export default ForgotPasswordPage;
