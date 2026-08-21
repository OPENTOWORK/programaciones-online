import { useLocalSearchParams } from 'expo-router';

import { TrainerAthleteScheduleBoard } from '@/components/trainer/TrainerAthleteScheduleBoard';

export default function TrainerAthleteCalendarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TrainerAthleteScheduleBoard athleteId={id ?? ''} />;
}
