import { Redirect, useLocalSearchParams } from 'expo-router';

import { TrainerAthleteScheduleBoard } from '@/components/trainer/TrainerAthleteScheduleBoard';
import { useAuth } from '@/hooks/useAuth';
import { isTrainerRole } from '@/lib/athleteService';
import { getTrainerAthleteDetailsHref } from '@/lib/navigation';

export default function TrainerAthleteCalendarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  if (!isTrainerRole(user?.role)) {
    return <Redirect href={getTrainerAthleteDetailsHref(id ?? '')} />;
  }

  return <TrainerAthleteScheduleBoard athleteId={id ?? ''} />;
}
