import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Button,
  PasswordInput,
  SheetField,
  sheetClasses,
} from '../../../components/ui/index.js';
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
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async ({ password }) => {
    setFormError(null);

    try {
      await authApi.resetPassword({
        token,
        password,
      });

      setDone(true);
    } catch (error) {
      setFormError(
        error.message ?? 'This reset link is invalid or has expired.',
      );
    }
  };

  if (!token) {
    return (
      <AuthScreen
        title="Invalid reset link"
        subtitle="This password reset link is missing or no longer valid."
        footer={
          <Link
            to="/forgot-password"
            className="
              font-semibold text-link
              underline-offset-4
              hover:underline
            "
          >
            Request a new link
          </Link>
        }
      >
        <Alert variant="danger">
          Please request a new password reset link and try again.
        </Alert>
      </AuthScreen>
    );
  }

  if (done) {
    return (
      <AuthScreen
        title="Password updated"
        subtitle="Your password has been successfully reset."
        footer={
          <Link
            to="/login"
            className="
              font-semibold text-link
              underline-offset-4
              hover:underline
            "
          >
            Sign in
          </Link>
        }
      >
        <Alert variant="success">
          Your password has been reset. You can now sign in with your new
          password.
        </Alert>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Set a new password"
      subtitle="Choose a strong password you'll remember."
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
            label="New password"
            error={errors.password?.message}
            hint={
              errors.password
                ? undefined
                : 'At least 8 characters, with a letter and a number.'
            }
            required
          >
            <PasswordInput
              autoComplete="new-password"
              placeholder="Create a new password"
              {...register('password')}
            />
          </SheetField>

          <SheetField
            label="Confirm password"
            error={errors.confirmPassword?.message}
            required
          >
            <PasswordInput
              autoComplete="new-password"
              placeholder="Enter it again"
              {...register('confirmPassword')}
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
          Reset password
        </Button>
      </form>
    </AuthScreen>
  );
}

export default ResetPasswordPage;
