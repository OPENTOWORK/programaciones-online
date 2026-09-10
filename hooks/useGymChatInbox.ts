import { useCallback, useEffect, useMemo, useState } from 'react';

import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useGym } from '@/hooks/useGym';
import { useGymMembers } from '@/hooks/useGymData';
import { fetchGymChatPreviews, type GymChatPreview } from '@/lib/gymChatService';
import { gymMemberFullName, gymMemberInitials, type GymMember } from '@/lib/gymTypes';

export type GymChatConversation = {
  member: GymMember;
  preview?: GymChatPreview;
};

export function useGymChatInbox() {
  const { gym } = useGym();
  const { members, isLoading, error, refresh: refreshMembers } = useGymMembers();
  const [previews, setPreviews] = useState<Record<string, GymChatPreview>>({});
  const [previewsLoading, setPreviewsLoading] = useState(true);

  const chatMembers = useMemo(
    () => members.filter((member) => member.status !== 'blocked'),
    [members],
  );

  const loadPreviews = useCallback(async () => {
    if (!gym) {
      setPreviews({});
      setPreviewsLoading(false);
      return;
    }

    if (isLoading) return;

    if (chatMembers.length === 0) {
      setPreviews({});
      setPreviewsLoading(false);
      return;
    }

    setPreviewsLoading(true);
    const data = await fetchGymChatPreviews(gym.id, chatMembers.map((member) => member.id));
    setPreviews(data);
    setPreviewsLoading(false);
  }, [chatMembers, gym, isLoading]);

  useEffect(() => {
    void loadPreviews();
  }, [loadPreviews]);

  const refreshInbox = useCallback(async () => {
    await refreshMembers();
    await loadPreviews();
  }, [loadPreviews, refreshMembers]);

  useFocusRefresh(() => {
    void refreshInbox();
  });

  const conversations = useMemo<GymChatConversation[]>(() => {
    return [...chatMembers]
      .map((member) => ({ member, preview: previews[member.id] }))
      .sort((left, right) => {
        const unreadDelta = (right.preview?.unread ?? 0) - (left.preview?.unread ?? 0);
        if (unreadDelta !== 0) return unreadDelta;

        const leftAt = left.preview?.lastAt ?? '';
        const rightAt = right.preview?.lastAt ?? '';
        if (leftAt !== rightAt) return rightAt.localeCompare(leftAt);

        return gymMemberFullName(left.member).localeCompare(gymMemberFullName(right.member), 'es');
      });
  }, [chatMembers, previews]);

  return {
    conversations,
    isLoading: isLoading || previewsLoading,
    error,
    refresh: refreshInbox,
    gymMemberInitials,
    gymMemberFullName,
  };
}
