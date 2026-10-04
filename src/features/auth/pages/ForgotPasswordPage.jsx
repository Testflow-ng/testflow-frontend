import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Button,
  Input,
  SheetField,
  sheetClasses,
} from '../../../components/ui/index.js';
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
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values) => {
    setFormError(null);

    try {
      await authApi.forgotPassword(values);
      setSubmitted(true);
    } catch (error) {
      setFormError(
        error.message ?? 'Something went wrong. Please try again.',
      );
    }
  };

  const backToLogin = (
    <Link
      to="/login"
      className="
        font-semibold text-link
        underline-offset-4
        hover:underline
      "
    >
      Back to sign in
    </Link>
  );

  if (submitted) {
    return (
      <AuthScreen
        title="Check your email"
        subtitle="We've sent password reset instructions if an account exists for that email."
        footer={backToLogin}
      >
        <Alert variant="success">
          Check your inbox for the password reset link. If you don't see it,
          check your spam or junk folder.
        </Alert>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Forgot your password?"
      subtitle="Enter the email linked to your account and we'll send you a reset link."
      footer={backToLogin}
    >
      <form
        className="flex flex-col"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {formError && (
          <Alert
            variant="danger"
            className="mb-5"
          >
            {formError}
          </Alert>
        )}

        <div className={sheetClasses()}>
          <SheetField
            label="Email"
            error={errors.email?.message}
            required
          >
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="you@example.com"
              {...register('email')}
            />
          </SheetField>
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting}
          className="mt-6"
        >
          Send reset link
        </Button>
      </form>
    </AuthScreen>
  );
}

export default ForgotPasswordPage;
