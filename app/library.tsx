import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ExerciseLibraryBrowser } from '@/components/library/ExerciseLibraryBrowser';
import { useAuth } from '@/hooks/useAuth';
import { isTrainerRole } from '@/lib/athleteService';

export default function ExerciseLibraryScreen() {
  const { user } = useAuth();

  return (
    <ScreenWrapper>
      <ExerciseLibraryBrowser
        title="Library · Exercises"
        subtitle="Todos los vídeos del canal de YouTube, listos para consultar la técnica de cada movimiento."
        canManage={isTrainerRole(user?.role)}
      />
    </ScreenWrapper>
  );
}
