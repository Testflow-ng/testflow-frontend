import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Alert, Button, Field, Input, PasswordInput } from '../../../components/ui/index.js';
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
      await login({ email: values.email, password: values.password });
      navigate('/setup');
    } catch (error) {
      if (error.code === 'EMAIL_TAKEN') {
        setError('email', { type: 'server', message: error.message });
      } else if (error.code === 'VALIDATION_ERROR' && error.data?.error?.fields) {
        const fields = error.data.error.fields;
        let hasFieldError = false;
        for (const [key, msg] of Object.entries(fields)) {
          if (['fullName', 'email', 'password', 'confirmPassword'].includes(key)) {
            setError(key, { type: 'server', message: msg });
            hasFieldError = true;
          }
        }
        if (!hasFieldError) {
          setFormError(error.message ?? 'Please check your input and try again.');
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
      subtitle="Join TestFlow and start practicing"
      footer={
        <>
          Already have an account?{' '}
          <Link
            className="font-semibold text-primary hover:underline"
            to="/login"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {formError && <Alert variant="danger">{formError}</Alert>}
        <Field label="Full name" error={errors.fullName?.message} required>
          <Input
            autoComplete="name"
            placeholder="Feranmi Oresajo"
            {...register('fullName')}
          />
        </Field>
        <Field label="Email" error={errors.email?.message} required>
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Password" error={errors.password?.message} required>
            <PasswordInput
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              {...register('password')}
            />
          </Field>
          <Field
            label="Confirm password"
            error={errors.confirmPassword?.message}
            required
          >
            <PasswordInput
              autoComplete="new-password"
              placeholder="Re-enter password"
              {...register('confirmPassword')}
            />
          </Field>
        </div>
        <p className="-mt-2 text-[10px] text-muted">
          Use at least 8 characters, including a letter and a number.
        </p>
        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          className="mt-1 h-12 text-base"
        >
          Create account
        </Button>
      </form>
    </AuthScreen>
  );
}

export default RegisterPage;
