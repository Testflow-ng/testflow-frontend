import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Alert, Button, Field, Input } from '../../../components/ui/index.js';
import { zodResolver } from '../../../utils/zodResolver.js';
import { forgotPasswordSchema } from '../schemas.js';
import { authApi } from '../api.js';
import AuthScreen from '../AuthScreen.jsx';

function ForgotPasswordPage() {
  const [formError, setFormError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await authApi.forgotPassword(values);
      setSubmitted(true);
    } catch (error) {
      setFormError(error.message ?? 'Something went wrong. Please try again.');
    }
  };

  const backToLogin = (
    <Link className="font-medium text-primary hover:underline" to="/login">
      Back to sign in
    </Link>
  );

  if (submitted) {
    return (
      <AuthScreen title="Check your email" subtitle="Password reset" footer={backToLogin}>
        <Alert variant="success">
          If an account exists for that email, we&apos;ve sent a link to reset your password.
        </Alert>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
      footer={backToLogin}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError ? <Alert variant="danger">{formError}</Alert> : null}
        <Field label="Email" error={errors.email?.message} required>
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
          />
        </Field>
        <Button type="submit" fullWidth loading={isSubmitting}>
          Send reset link
        </Button>
      </form>
    </AuthScreen>
  );
}

export default ForgotPasswordPage;
