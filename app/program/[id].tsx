import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { IconBadge } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { goalLabels, levelColors, statusColors, colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useProgram } from '@/hooks/usePrograms';
import { isTrainerRole } from '@/lib/athleteService';
import { isTrainerEditableCategory } from '@/lib/programService';
import { startUserProgram, isProgramActiveForUser } from '@/lib/userProgramService';

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { program, workouts } = useProgram(id ?? '');
  const [starting, setStarting] = useState(false);

  if (!program) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>Programación no encontrada</Text>
      </ScreenWrapper>
    );
  }

  const isLocked = program.status === 'bloqueada';
  const isUserActive = isProgramActiveForUser(program.id, user?.currentPrograms, user?.currentProgramId);
  const canEdit = isTrainerRole(user?.role) && isTrainerEditableCategory(program.category);

  const handleStart = async () => {
    if (isLocked || !workouts[0]) return;

    if (isUserActive) {
      return;
    }

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

    await refreshUser();
    router.push(`/workout/${workouts[0].id}`);
  };

  return (
    <ScreenWrapper>
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
        {program.duration !== 'Por definir' ? <InfoRow label="Duración" value={program.duration} /> : null}
        <InfoRow label="Objetivo" value={goalLabels[program.goal]} />
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
              <Text key={item} style={styles.listItem}>• {item}</Text>
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

      {workouts.length > 0 ? (
        <>
          {!workouts[0]?.workoutDate ? <SectionHeader title="Sesiones (Semana 1)" /> : null}
          {workouts.map((workout) => (
            <Card key={workout?.id} style={styles.sessionCard} onPress={() => router.push(`/workout/${workout?.id}`)}>
              <Text style={styles.sessionName}>{workout?.name}</Text>
              <Text style={styles.sessionMeta}>
                {workout?.workoutDate ?? workout?.dayLabel} · {workout?.estimatedDuration} ·{' '}
                {workout?.exercises.length} ejercicios
              </Text>
            </Card>
          ))}
        </>
      ) : null}

      {!isLocked && !isUserActive ? (
        <Button
          title="Empezar programación"
          onPress={handleStart}
          disabled={!workouts[0]}
          loading={starting}
          style={styles.cta}
        />
      ) : null}

      {canEdit ? (
        <Button
          title="Editar programación"
          variant="outline"
          onPress={() => router.push({ pathname: '/trainer/program/[id]/edit', params: { id: program.id } })}
          style={styles.cta}
        />
      ) : null}
    </ScreenWrapper>
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
  sessionName: { ...typography.body, color: colors.text, fontWeight: '600' },
  sessionMeta: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  cta: { marginTop: spacing.md },
  error: { ...typography.body, color: colors.danger, textAlign: 'center' },
});
