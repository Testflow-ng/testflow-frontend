import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Alert, Button, Field, Input, PasswordInput } from '../../../components/ui/index.js';
import { zodResolver } from '../../../utils/zodResolver.js';
import { registerSchema } from '../schemas.js';
import { authApi } from '../api.js';
import AuthScreen from '../AuthScreen.jsx';

function RegisterPage() {
  const [formError, setFormError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', matricNumber: '', password: '' },
  });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await authApi.register(values);
      setSubmitted(true);
    } catch (error) {
      setFormError(error.message ?? 'Unable to create your account. Please try again.');
    }
  };

  if (submitted) {
    return (
      <AuthScreen
        title="Check your email"
        subtitle="One last step"
        footer={
          <Link className="font-medium text-primary hover:underline" to="/login">
            Back to sign in
          </Link>
        }
      >
        <Alert variant="success">
          Your account has been created. We sent a verification link to your email. Open it to
          verify your address.
        </Alert>
      </AuthScreen>
    );
  }

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
          <Input autoComplete="name" placeholder="Ada Lovelace" {...register('fullName')} />
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
        <Field
          label="Password"
          error={errors.password?.message}
          hint="At least 8 characters, including a letter and a number."
          required
        >
          <PasswordInput
            autoComplete="new-password"
            placeholder="Create a password"
            {...register('password')}
          />
        </Field>
        <Button type="submit" fullWidth loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthScreen>
  );
}

export default RegisterPage;
