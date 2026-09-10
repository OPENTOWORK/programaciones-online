import { Redirect, useLocalSearchParams } from 'expo-router';

import { TrainerAthleteScheduleBoard } from '@/components/trainer/TrainerAthleteScheduleBoard';
import { useAuth } from '@/hooks/useAuth';
import { isAdminRole } from '@/lib/athleteService';

export default function TrainerAthleteCalendarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  if (!isAdminRole(user?.role)) {
    return <Redirect href={{ pathname: '/trainer/athlete/[id]', params: { id: id ?? '' } }} />;
  }

  return <TrainerAthleteScheduleBoard athleteId={id ?? ''} />;
}
