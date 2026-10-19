import { Megaphone } from 'lucide-react';
import { EmptyState, SkeletonCard, useToast } from '../../../components/ui/index.js';
import PostCard from '../../../components/everybody/PostCard.jsx';
import PostComposer from '../../../components/everybody/PostComposer.jsx';
import PlanLock from '../../../components/everybody/PlanLock.jsx';
import { usePlanFeatures } from '../usePlanFeatures.js';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { wsApi } from '../api.js';
import { useOrg } from '../OrgContext.js';
import { usePosts, useWsMutation } from '../useWorkspace.js';

/** Short notices for your students. They see them on their home page when they sign in. */
function AnnouncementsScreen() {
  const toast = useToast();
  const { org } = useOrg();
  const { data, isLoading } = usePosts();
  const save = useWsMutation((id, post) => wsApi.savePost(id, post), { onError: (e) => toast.error('Could not update', e.message) });
  const del = useWsMutation((id, postId) => wsApi.deletePost(id, postId), { onSuccess: () => toast.success('Announcement deleted') });

  const post = async ({ text }) => { await save.mutateAsync({ type: 'announcement', text }); toast.success('Announcement posted', 'Students see it on their home page.'); };

  const { canAnnounce } = usePlanFeatures();
  return (
    <Screen width="lg">
      <PageHeader title="Announcements" subtitle="Tell your students about a new exam, a date or a change. They see it when they sign in." />
      <PlanLock locked={!canAnnounce} plan="Pro" title="Announcements are part of Pro" description="Post notices that students see on their home page." className="mt-8">
      <div className="mt-8 space-y-6">
        <PostComposer onSubmit={post} placeholder="Write an announcement for your students" />
        {isLoading ? <SkeletonCard className="h-32" /> : !data?.length ? (
          <EmptyState icon={Megaphone} title="No announcements yet" description="Your first one will show on your students' home page." />
        ) : (
          <ul className="space-y-3">
            {data.map((p) => (
              <li key={p.id}>
                <PostCard post={{ ...p, author: org.name, type: 'announcement' }} moderation={{ onPin: (x) => save.mutate({ id: x.id, pinned: !x.pinned }), onHide: (x) => save.mutate({ id: x.id, hidden: !x.hidden }), onDelete: (x) => del.mutate(x.id) }} />
              </li>
            ))}
          </ul>
        )}
      </div>
      </PlanLock>
    </Screen>
  );
}

export default AnnouncementsScreen;
