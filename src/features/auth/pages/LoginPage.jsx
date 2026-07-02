import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Alert, Button, Field, Input, PasswordInput } from '../../../components/ui/index.js';
import { zodResolver } from '../../../utils/zodResolver.js';
import { loginSchema } from '../schemas.js';
import { useAuth } from '../useAuth.js';
import AuthScreen from '../AuthScreen.jsx';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const from = location.state?.from?.pathname ?? '/dashboard';

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(error.message ?? 'Unable to sign in. Please try again.');
    }
  };

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in to continue to TestFlow"
      footer={
        <>
          New here?{' '}
          <Link className="font-medium text-primary hover:underline" to="/register">
            Create an account
          </Link>
        </>
      }
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
        <Field label="Password" error={errors.password?.message} required>
          <PasswordInput
            autoComplete="current-password"
            placeholder="Your password"
            {...register('password')}
          />
        </Field>
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth loading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </AuthScreen>
  );
}

export default LoginPage;
