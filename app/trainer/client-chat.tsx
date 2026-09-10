import { Redirect, Stack } from 'expo-router';

import { AthleteTrainerChatScreen } from '@/components/chat/AthleteTrainerChatScreen';
import { useAuth } from '@/hooks/useAuth';
import { isTrainerOnlyRole } from '@/lib/athleteService';

export default function TrainerClientChatScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isTrainerOnlyRole(user?.role)) {
    return <Redirect href="/tabs/programs" />;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Tu entrenador' }} />
      <AthleteTrainerChatScreen />
    </>
  );
}
