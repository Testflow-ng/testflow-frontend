import { useParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { Button, EmptyState, SkeletonCard } from '../../components/ui/index.js';
import Screen from '../../components/layout/Screen.jsx';
import { useHostRoom, useMembership } from './useLive.js';
import HostRoom from './HostRoom.jsx';
import ParticipantRoom from './ParticipantRoom.jsx';

/** /live/:code. The host sees the control room; everyone else sees the participant flow. */
function LiveRoomPage() {
  const { code } = useParams();
  const host = useHostRoom(code);
  const member = useMembership(code, host.isError);

  if (host.isLoading || (host.isError && member.isLoading)) {
    return (
      <Screen width="xl">
        <SkeletonCard className="h-24" />
        <SkeletonCard className="mt-4 h-64" />
      </Screen>
    );
  }

  if (host.isSuccess) return <HostRoom room={host.data} code={code} />;
  if (member.isSuccess) return <ParticipantRoom room={member.data} code={code} />;

  return (
    <Screen width="md">
      <EmptyState
        icon={SearchX}
        title="Session not found"
        description="Check the code with your host. Codes are six or more letters and numbers."
        action={<Button onClick={() => window.history.back()}>Go back</Button>}
      />
    </Screen>
  );
}

export default LiveRoomPage;
