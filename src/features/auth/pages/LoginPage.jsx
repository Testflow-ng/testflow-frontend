import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
      const msg = error.code === 'VALIDATION_ERROR'
        ? 'Please enter a valid email and password.'
        : (error.message ?? 'Unable to sign in. Please try again.');
      setFormError(msg);
    }
  };

  return (
    <AuthScreen
      title="Sign in"
      subtitle="Your papers, scores and streak are where you left them."
      footer={
        <>
          No account yet?{' '}
          <Link className="font-semibold text-link underline-offset-4 hover:underline" to="/register">
            Create one
          </Link>
        </>
      }
    >
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError && (
          <Alert variant="danger" className="mb-4">
            {formError}
          </Alert>
        )}

        <div className={sheetClasses()}>
          <SheetField label="Email" error={errors.email?.message} required>
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
          <SheetField label="Password" error={errors.password?.message} required>
            <PasswordInput
              autoComplete="current-password"
              placeholder="Your password"
              {...register('password')}
            />
          </SheetField>
        </div>

        <Link
          to="/forgot-password"
          className="tf-pressable mt-3 self-start rounded-full text-[13px] font-semibold text-link underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>

        <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-5">
          Sign in
        </Button>
      </form>
    </AuthScreen>
  );
}

export default LoginPage;
