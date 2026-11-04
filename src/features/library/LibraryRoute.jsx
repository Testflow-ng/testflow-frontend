import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { LIBRARY_GATED } from './flags.js';
import LibraryPage from './LibraryPage.jsx';
import ReaderPage from './ReaderPage.jsx';
import LibraryComingSoon from './LibraryComingSoon.jsx';

export function LibraryRoute() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);
  const isPreview = params.get('preview') === '1' || params.get('preview') === 'true';

  if (LIBRARY_GATED && !isAdmin && !isPreview) {
    return <LibraryComingSoon />;
  }

  return <LibraryPage isGatedPreview={LIBRARY_GATED && (isAdmin || isPreview)} />;
}

export function ReaderRoute() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);
  const isPreview = params.get('preview') === '1' || params.get('preview') === 'true';

  if (LIBRARY_GATED && !isAdmin && !isPreview) {
    return <LibraryComingSoon />;
  }

  return <ReaderPage />;
}
