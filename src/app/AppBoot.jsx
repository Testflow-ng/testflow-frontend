import { useAuth } from '../features/auth/useAuth.js';
import SplashScreen from '../components/SplashScreen.jsx';

/**
 * Holds the branded splash on screen while the initial session probe (/me) is
 * in flight, so the first paint is the splash rather than a flash of app UI.
 */
function AppBoot({ children }) {
  const { isLoading } = useAuth();
  return isLoading ? <SplashScreen /> : children;
}

export default AppBoot;
