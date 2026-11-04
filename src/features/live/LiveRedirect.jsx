import { Navigate, useParams } from 'react-router-dom';

/** Invite links from the backend look like /live-cbt/:code; the app lives at /live/:code. */
function LiveRedirect() {
  const { code } = useParams();
  return <Navigate to={`/live/${code}`} replace />;
}

export default LiveRedirect;
