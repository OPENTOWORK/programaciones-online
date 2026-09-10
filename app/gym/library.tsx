import { GymScreen, GymScreenHeader } from '@/components/gym/GymScreen';
import { ExerciseLibraryBrowser } from '@/components/library/ExerciseLibraryBrowser';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';

export default function GymLibraryScreen() {
  return (
    <GymScreen>
      <ScreenWrapper>
        <GymScreenHeader
          title="Biblioteca de vídeos"
          subtitle="Todos los vídeos del canal y los que suba el equipo"
        />
        <ExerciseLibraryBrowser canManage />
      </ScreenWrapper>
    </GymScreen>
  );
}
