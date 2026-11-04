import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/useAuth.js';
import PageLoader from '../../../components/PageLoader.jsx';
import PostUtmeLockScreen from './PostUtmeLockScreen.jsx';
import PostUtmeWelcomeFlow from '../components/PostUtmeWelcomeFlow.jsx';
import PostUtmeDashboard from '../components/PostUtmeDashboard.jsx';
import { Alert } from '../../../components/ui/index.js';
import apiClient from '../../../api/client.js';

function PostUtmeHub() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(() => {
    return user?.postUtmeStatus === 'verified' && !localStorage.getItem('tf_utme_welcomed');
  });

  const { data: config, isLoading: isConfigLoading, isError } = useQuery({
    queryKey: ['publicConfig'],
    queryFn: async () => {
      const res = await apiClient.get('/api/public/config');
      return res.data;
    },
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['postUtmeStats'],
    queryFn: async () => {
      const res = await apiClient.get('/api/post-utme/stats');
      return res.data.stats;
    },
    enabled: user?.postUtmeStatus === 'verified',
  });

  if (isConfigLoading || (user?.isPostUtmePaid && isStatsLoading)) return <PageLoader label="Opening the Vault" />;
  if (isError) return <div className="p-10 text-center"><Alert variant="danger">Connection Error. Please try again.</Alert></div>;

  if (!config?.isPostUtmeActive) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h2 className="text-xl font-bold text-foreground-strong">Post-UTME Closed</h2>
        <p className="text-sm text-muted mt-2">The Post-UTME mock session is currently inactive. Please check back during the next admission cycle.</p>
      </div>
    );
  }

  // Use the formal state machine status
  if (user?.postUtmeStatus !== 'verified') {
    return <PostUtmeLockScreen config={config} />;
  }

  if (showWelcome) {
    return <PostUtmeWelcomeFlow onComplete={() => setShowWelcome(false)} />;
  }

  return <PostUtmeDashboard stats={stats} isLoading={isStatsLoading} />;
}

export default PostUtmeHub;
