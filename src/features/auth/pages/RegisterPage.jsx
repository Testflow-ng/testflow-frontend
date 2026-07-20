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
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      matricNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await authApi.register(values);
      // Auto-login after registration since verification is disabled
      await login({ email: values.email, password: values.password });
      navigate('/dashboard');
    } catch (error) {
      setFormError(error.message ?? 'Unable to create your account. Please try again.');
    }
  };

  return (
    <AuthScreen
      title="Create your account"
      subtitle="Join TestFlow to start your assessments"
      footer={
        <>
          Already have an account?{' '}
          <Link className="font-medium text-primary hover:underline" to="/login">
            Sign in
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError ? <Alert variant="danger">{formError}</Alert> : null}
        <Field label="Full name" error={errors.fullName?.message} required>
          <Input autoComplete="name" placeholder="Feranmi oresajo" {...register('fullName')} />
        </Field>
        <Field
          label="Username"
          error={errors.username?.message}
          required
          hint="Unique handle for leaderboards"
        >
          <Input autoComplete="username" placeholder="ada_l1" {...register('username')} />
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
        <Field label="Matric number" hint="Optional" error={errors.matricNumber?.message}>
          <Input autoComplete="off" placeholder="e.g. CSC/2021/001" {...register('matricNumber')} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Password" error={errors.password?.message} required>
            <PasswordInput
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('password')}
            />
          </Field>
          <Field label="Confirm Password" error={errors.confirmPassword?.message} required>
            <PasswordInput
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('confirmPassword')}
            />
          </Field>
        </div>
        <p className="text-[10px] text-muted -mt-2">
          Use at least 8 characters, including a letter and a number.
        </p>
        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          className="mt-2 h-12 text-base shadow-lg shadow-primary/20"
        >
          Create account
        </Button>
      </form>
    </AuthScreen>
  );
}

export default RegisterPage;
