import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Button,
  Input,
  PasswordInput,
  SheetField,
  sheetClasses,
} from '../../../components/ui/index.js';
import { zodResolver } from '../../../utils/zodResolver.js';
import { registerSchema } from '../schemas.js';
import { authApi } from '../api.js';
import AuthScreen from '../AuthScreen.jsx';
import { useAuth } from '../useAuth.js';

function RegisterPage() {
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    setFormError(null);

    try {
      await authApi.register(values);
      await login({
        email: values.email,
        password: values.password,
      });

      navigate('/setup');
    } catch (error) {
      if (error.code === 'EMAIL_TAKEN') {
        setError('email', {
          type: 'server',
          message: error.message,
        });
      } else if (
        error.code === 'VALIDATION_ERROR' &&
        error.data?.error?.fields
      ) {
        const fields = error.data.error.fields;
        let hasFieldError = false;

        for (const [key, message] of Object.entries(fields)) {
          if (
            ['fullName', 'email', 'password', 'confirmPassword'].includes(key)
          ) {
            setError(key, {
              type: 'server',
              message,
            });

            hasFieldError = true;
          }
        }

        if (!hasFieldError) {
          setFormError(
            error.message ?? 'Please check your input and try again.',
          );
        }
      } else {
        setFormError(
          error.message ?? 'Unable to create your account. Please try again.',
        );
      }
    }
  };

  return (
    <AuthScreen
      title="Create your account"
      subtitle="Free to join. Set up your account and start practicing in about a minute."
      footer={
        <>
          Already have an account?{' '}
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
        </>
      }
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
            label="Full name"
            error={errors.fullName?.message}
            required
          >
            <Input
              autoComplete="name"
              placeholder="Your full name"
              {...register('fullName')}
            />
          </SheetField>

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

          <SheetField
            label="Password"
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
              placeholder="Create a password"
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
          Create account
        </Button>
      </form>
    </AuthScreen>
  );
}

export default RegisterPage;
