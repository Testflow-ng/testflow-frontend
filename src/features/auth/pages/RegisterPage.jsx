import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '../../../utils/zodResolver.js';
import { adsRegisterSchema, everybodyRegisterSchema, registerSchema } from '../schemas.js';
import { authApi } from '../api.js';
import { adsAuthApi } from '../../ads/adsAuthApi.js';
import { useAuth } from '../useAuth.js';
import { AUTH_PRODUCTS } from '../paths.js';
import AuthShell from '../ui/AuthShell.jsx';
import AuthField from '../ui/AuthField.jsx';

const FIELD_NAMES = ['fullName', 'email', 'password', 'confirmPassword', 'businessName', 'contactPhone', 'organizationName'];

/** Create an account. `product="ads"` creates an advertiser via /api/ads/auth/register. */
function RegisterPage({ product = 'student' }) {
  const { isAuthenticated } = useAuth();
  const isAds = product === 'ads';
  const isEverybody = product === 'everybody';
  const cfg = AUTH_PRODUCTS[product];
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isAds ? adsRegisterSchema : isEverybody ? everybodyRegisterSchema : registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      businessName: '',
      contactPhone: '',
      organizationName: '',
    },
  });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      if (isAds) {
        const { contactPhone, ...rest } = values;
        await adsAuthApi.register(contactPhone ? { ...rest, contactPhone } : rest);
      } else if (isEverybody) {
        // Unified identity: adds the `everybody` membership. Registration does not sign in.
        await authApi.register({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
          product: 'everybody',
          profile: { organizationName: values.organizationName },
        });
      } else {
        await authApi.register({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
        });
        await login({ email: values.email, password: values.password });
      }
      // Carry the page that sent the visitor here (for example an invite link)
      // through registration. Ads and organisation signups keep their own landing.
      const from = !isAds && !isEverybody ? location.state?.from : null;
      const target = from ? `${from.pathname ?? ''}${from.search ?? ''}${from.hash ?? ''}` : cfg.afterRegister;
      navigate(target, { replace: true });
    } catch (error) {
      if (error.code === 'EMAIL_TAKEN') {
        setError('email', {
          type: 'server',
          message: isAds
            ? 'This email is already registered. Advertisers need an email that is not used by a student account.'
            : error.message,
        });
        return;
      }
      const fields = error.code === 'VALIDATION_ERROR' ? error.data?.error?.fields : null;
      let matched = false;
      if (fields) {
        for (const [key, message] of Object.entries(fields)) {
          if (FIELD_NAMES.includes(key)) {
            setError(key, { type: 'server', message });
            matched = true;
          }
        }
      }
      if (!matched) setFormError(error.message ?? 'Unable to create your account. Please try again.');
    }
  };

  // Already signed in to Testflow: no new account. Ask to authorize the product instead.
  if (isEverybody && isAuthenticated) return <Navigate to="/everybody/authorize" replace />;

  return (
    <AuthShell
      product={product}
      title={isAds ? 'Start' : isEverybody ? 'Create your' : 'Create your'}
      accent={isAds ? 'advertising.' : isEverybody ? 'platform.' : 'account.'}
      subtitle={
        isAds
          ? 'Create an advertiser account to build, pay for and track your campaigns.'
          : isEverybody
            ? 'Register your organisation to launch a branded CBT platform. You will pick a plan next.'
            : 'Free to join. Set up your account and start practising in about a minute.'
      }
      footer={
        <>
          Already have an account? <Link to={cfg.login} state={location.state}>Sign in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError && (
          <p className="auth-alert auth-alert-danger" role="alert">
            {formError}
          </p>
        )}
        <AuthField label="Full name" autoComplete="name" placeholder="Your full name" error={errors.fullName?.message} {...register('fullName')} />
        {isEverybody && (
          <AuthField
            label="Organisation name"
            autoComplete="organization"
            placeholder="Advance Tutorials"
            error={errors.organizationName?.message}
            {...register('organizationName')}
          />
        )}
        {isAds && (
          <div className="auth-two">
            <AuthField
              label="Business or brand"
              autoComplete="organization"
              placeholder="Campus Laptops"
              error={errors.businessName?.message}
              {...register('businessName')}
            />
            <AuthField
              label="Phone (optional)"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0801 234 5678"
              error={errors.contactPhone?.message}
              {...register('contactPhone')}
            />
          </div>
        )}
        <AuthField
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        {/* <div className="auth-two"> */}
          <AuthField
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            hint="8+ characters, a letter and a number."
            error={errors.password?.message}
            {...register('password')}
          />
        {/* </div> */}
            <AuthField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter it again"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : isAds ? 'Create advertiser account' : isEverybody ? 'Create my platform' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}

export default RegisterPage;
