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
      /*
        No invented proof. There is no real user count to quote, and a made-up
        one would be the first thing a sceptical student could check and
        disprove. What is true and worth saying is what it costs and how long
        it takes.
      */
      subtitle="Free, and no card. You can be sitting your first paper in about a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link className="font-semibold text-link underline-offset-4 hover:underline" to="/login">
            Sign in
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
          {/*
            No sample-name placeholder. The old one used a real person's name,
            and with the label already visible a placeholder here only competes
            with the value the user is about to type.
          */}
          <SheetField label="Full name" error={errors.fullName?.message} required>
            <Input autoComplete="name" {...register('fullName')} />
          </SheetField>
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
          <SheetField
            label="Password"
            error={errors.password?.message}
            // The rule lives on the field it applies to, not in a detached
            // line under the whole form where it is read after the mistake.
            hint={errors.password ? undefined : 'At least 8 characters, with a letter and a number.'}
            required
          >
            <PasswordInput autoComplete="new-password" {...register('password')} />
          </SheetField>
          <SheetField
            label="Confirm password"
            error={errors.confirmPassword?.message}
            required
          >
            <PasswordInput autoComplete="new-password" {...register('confirmPassword')} />
          </SheetField>
        </div>

        <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-5">
          Create account
        </Button>
      </form>
    </AuthScreen>
  );
}

export default RegisterPage;
