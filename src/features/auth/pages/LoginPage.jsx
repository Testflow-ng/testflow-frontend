import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '../../../utils/zodResolver.js';
import { loginSchema } from '../schemas.js';
import { useAuth } from '../useAuth.js';
import { adsAuthApi } from '../../ads/adsAuthApi.js';
import { AUTH_PRODUCTS } from '../paths.js';
import AuthShell from '../ui/AuthShell.jsx';
import AuthField from '../ui/AuthField.jsx';

/** Sign in. `product="ads"` signs an advertiser in through /api/ads/auth/login. */
function LoginPage({ product = 'student' }) {
  const cfg = AUTH_PRODUCTS[product];
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const from = location.state?.from?.pathname ?? cfg.afterLogin;

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      if (product === 'ads') await adsAuthApi.login(values);
      else await login(product === 'everybody' ? { ...values, product: 'everybody' } : values);
      navigate(from, { replace: true });
    } catch (error) {
      // A Testflow account without Testflow for Everyone yet: sign in as normal, then ask to authorize.
      if (product === 'everybody' && error.code === 'NO_MEMBERSHIP') {
        try {
          await login(values);
          navigate('/everybody/authorize', { replace: true });
          return;
        } catch {
          /* fall through to the message below */
        }
      }
      setFormError(
        error.code === 'VALIDATION_ERROR'
          ? 'Please enter a valid email and password.'
          : error.code === 'NO_MEMBERSHIP' || error.code === 'NOT_AN_ADVERTISER'
            ? `This account isn’t set up for ${product === 'ads' ? 'TestFlow Ads' : cfg.label ?? 'this product'} yet. Create an account to get started.`
            : (error.message ?? 'Unable to sign in. Please try again.'),
      );
    }
  };

  return (
    <AuthShell
      product={product}
      title="Welcome"
      accent="back."
      subtitle={product === 'ads' ? 'Sign in to manage your campaigns.' : product === 'everybody' ? 'Sign in to manage your organisation.' : 'Continue to your papers, scores and streak.'}
      footer={
        <>
          {product === 'ads' ? 'New advertiser?' : product === 'everybody' ? 'New here?' : 'No account yet?'}{' '}
          <Link to={cfg.register} state={location.state}>
            {product === 'ads' ? 'Create an advertiser account' : product === 'everybody' ? 'Create your platform' : 'Create one'}
          </Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError && (
          <p className="auth-alert auth-alert-danger" role="alert">
            {formError}
          </p>
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
        <AuthField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="auth-row">
          <Link to={cfg.forgot} className="auth-link">
            Forgot password?
          </Link>
        </div>
        <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
