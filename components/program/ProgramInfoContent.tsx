import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { IconBadge } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SessionCardActions } from '@/components/program/SessionCardActions';
import { goalLabels, levelColors, statusColors, colors, spacing, typography } from '@/constants/theme';
import { startUserProgram, isProgramActiveForUser } from '@/lib/userProgramService';
import type { Program, UserProfile, Workout } from '@/lib/types';

function formatSessionMeta(workout: Workout) {
  const label = workout.workoutDate?.startsWith('2000-')
    ? workout.dayLabel
    : (workout.workoutDate ?? workout.dayLabel);

  return `${label} · ${workout.estimatedDuration} · ${workout.exercises.length} ejercicios`;
}

interface ProgramInfoContentProps {
  program: Program;
  workouts: Workout[];
  isLoadingWorkouts?: boolean;
  user: UserProfile | null;
  canEdit: boolean;
  onRefreshWorkouts?: () => void;
  onUserRefresh?: (force?: boolean) => Promise<unknown>;
  showCalendarLink?: boolean;
}

export function ProgramInfoContent({
  program,
  workouts,
  isLoadingWorkouts = false,
  user,
  canEdit,
  onRefreshWorkouts,
  onUserRefresh,
  showCalendarLink = true,
}: ProgramInfoContentProps) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  const isLocked = program.status === 'bloqueada';
  const isUserActive = isProgramActiveForUser(program.id, user?.currentPrograms, user?.currentProgramId);

  const handleStart = async () => {
    if (isLocked || !workouts[0]) return;
    if (isUserActive) return;

    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para empezar una programación.');
      return;
    }

    setStarting(true);
    const { error } = await startUserProgram(user.id, program.id);
    setStarting(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    await onUserRefresh?.();
    router.push(`/workout/${workouts[0].id}`);
  };

  return (
    <View style={styles.content}>
      {showCalendarLink ? (
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/program/[id]',
              params: { id: program.id },
            })
          }
          style={({ pressed }) => [styles.calendarLink, pressed && styles.calendarLinkPressed]}
          accessibilityRole="link"
        >
          <Text style={styles.calendarLinkText}>Ver calendario de sesiones</Text>
        </Pressable>
      ) : null}

      <View style={styles.hero}>
        <IconBadge name={program.icon} containerSize={72} size={36} />
        <Text style={styles.name}>{program.name}</Text>
        <View style={styles.badges}>
          <Badge label={program.level} color={levelColors[program.level]} />
          <Badge label={program.status} color={statusColors[program.status]} />
        </View>
      </View>

      <Card>
        <Text style={styles.description}>{program.description}</Text>
        {(program.duration as string) !== 'Por definir' ? (
          <InfoRow label="Duración" value={program.duration} />
        ) : null}
        {program.goal ? <InfoRow label="Objetivo" value={goalLabels[program.goal]} /> : null}
        {program.sessionsPerWeek > 0 ? (
          <InfoRow label="Sesiones/semana" value={`${program.sessionsPerWeek}`} />
        ) : null}
        {program.trainingDays.length > 0 ? (
          <InfoRow label="Días" value={program.trainingDays.join(', ')} />
        ) : null}
      </Card>

      {program.equipment.length > 0 ? (
        <>
          <SectionHeader title="Material necesario" />
          <Card>
            {program.equipment.map((item) => (
              <Text key={item} style={styles.listItem}>
                • {item}
              </Text>
            ))}
          </Card>
        </>
      ) : null}

      {program.weeks.length > 0 ? (
        <>
          <SectionHeader title="Semanas" subtitle={`${program.weeks.length} semanas de entrenamiento`} />
          {program.weeks.slice(0, 4).map((week) => (
            <Card key={week.id} style={styles.weekCard}>
              <Text style={styles.weekTitle}>{week.title}</Text>
              <Text style={styles.weekSessions}>{week.sessionIds.length} sesiones</Text>
            </Card>
          ))}
          {program.weeks.length > 4 ? (
            <Text style={styles.moreWeeks}>+ {program.weeks.length - 4} semanas más...</Text>
          ) : null}
        </>
      ) : null}

      {isLoadingWorkouts ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : workouts.length > 0 ? (
        <>
          <SectionHeader title="Sesiones" subtitle={`${workouts.length} sesiones disponibles`} />
          {workouts.map((workout) => (
            <Card key={workout.id} style={styles.sessionCard}>
              <View style={styles.sessionRow}>
                <View style={styles.sessionCopy}>
                  <Text style={styles.sessionName}>{workout.name}</Text>
                  <Text style={styles.sessionMeta}>{formatSessionMeta(workout)}</Text>
                </View>
                <SessionCardActions
                  programId={program.id}
                  workoutId={workout.id}
                  workoutName={workout.name}
                  canManage={canEdit}
                  onDeleted={() => void onRefreshWorkouts?.()}
                />
              </View>
            </Card>
          ))}
        </>
      ) : (
        <Card style={styles.emptySessionsCard}>
          <Text style={styles.emptySessionsTitle}>Sin sesiones todavía</Text>
          <Text style={styles.emptySessionsText}>
            {canEdit
              ? 'Crea la primera sesión con el botón de abajo.'
              : 'Esta programación aún no tiene entrenos publicados.'}
          </Text>
        </Card>
      )}

      {!isLocked && !isUserActive ? (
        <Button
          title="Empezar programación"
          onPress={() => void handleStart()}
          disabled={!workouts[0]}
          loading={starting}
          style={styles.cta}
        />
      ) : null}

      {canEdit ? (
        <>
          <Button
            title="Crear sesión"
            onPress={() =>
              router.push({
                pathname: '/trainer/program/[id]/session/[workoutId]',
                params: { id: program.id, workoutId: 'new' },
              })
            }
            style={styles.cta}
          />
          <Button
            title="Editar programación"
            variant="outline"
            onPress={() => router.push({ pathname: '/trainer/program/[id]/edit', params: { id: program.id } })}
            style={styles.cta}
          />
        </>
      ) : null}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: spacing.xl },
  calendarLink: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  calendarLinkPressed: {
    opacity: 0.85,
  },
  calendarLinkText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
  },
  loader: { marginTop: spacing.xl },
  hero: { alignItems: 'center', marginBottom: spacing.lg, gap: spacing.sm },
  name: { ...typography.h1, color: colors.text, textAlign: 'center', marginTop: spacing.sm },
  badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  description: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md, lineHeight: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  rowLabel: { ...typography.bodySmall, color: colors.textMuted },
  rowValue: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
  listItem: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xs },
  weekCard: { marginBottom: spacing.sm },
  weekTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  weekSessions: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  moreWeeks: { ...typography.bodySmall, color: colors.accent, textAlign: 'center', marginBottom: spacing.md },
  sessionCard: { marginBottom: spacing.sm },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  sessionCopy: { flex: 1, minWidth: 180 },
  sessionName: { ...typography.body, color: colors.text, fontWeight: '600' },
  sessionMeta: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  emptySessionsCard: { marginBottom: spacing.md },
  emptySessionsTitle: { ...typography.body, color: colors.text, fontWeight: '600', marginBottom: spacing.xs },
  emptySessionsText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 22 },
  cta: { marginTop: spacing.md },
});
