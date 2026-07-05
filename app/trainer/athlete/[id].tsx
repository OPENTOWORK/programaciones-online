import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { goalLabels, levelColors, colors, spacing, typography } from '@/constants/theme';
import { useAthlete } from '@/hooks/useAthletes';
import { useAuth } from '@/hooks/useAuth';
import { fetchAthletePlansForAthlete } from '@/lib/athletePlanService';
import { ATHLETE_PLAN_TYPE_LABELS } from '@/lib/trainerConstants';
import type { AthletePlan } from '@/lib/types';

function formatOptionalValue(value: string | number | undefined, suffix = '') {
  if (value === undefined || value === null || value === '') {
    return 'No indicado';
  }

  return `${value}${suffix}`;
}

export default function AthleteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { athlete, isLoading } = useAthlete(id ?? '');
  const [assignedPlans, setAssignedPlans] = useState<AthletePlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      if (!id || !user?.id) {
        setAssignedPlans([]);
        setPlansLoading(false);
        return;
      }

      setPlansLoading(true);
      try {
        const data = await fetchAthletePlansForAthlete(id, user.id);
        if (!cancelled) setAssignedPlans(data);
      } catch {
        if (!cancelled) setAssignedPlans([]);
      } finally {
        if (!cancelled) setPlansLoading(false);
      }
    }

    void loadPlans();

    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  if (isLoading) {
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (!athlete) {
    return (
      <ScreenWrapper>
        <Text style={styles.error}>Atleta no encontrado</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{athlete.avatarInitials}</Text>
        </View>
        <Text style={styles.name}>{athlete.name}</Text>
        <Text style={styles.email}>{athlete.email}</Text>
        <View style={styles.badges}>
          {athlete.fitnessLevel ? (
            <Text style={[styles.badge, { color: levelColors[athlete.fitnessLevel] }]}>
              {athlete.fitnessLevel}
            </Text>
          ) : null}
          {athlete.mainGoal ? (
            <Text style={[styles.badge, { color: colors.accentBlue }]}>{goalLabels[athlete.mainGoal]}</Text>
          ) : null}
        </View>
      </View>

      <Card>
        <SectionHeader title="Datos físicos" />
        <InfoRow label="Altura" value={formatOptionalValue(athlete.height, ' cm')} />
        <InfoRow label="Peso" value={formatOptionalValue(athlete.weight, ' kg')} />
        <InfoRow label="Limitaciones" value={formatOptionalValue(athlete.injuries)} />
      </Card>

      <Card style={styles.programCard}>
        <SectionHeader title="Programación actual" />
        {athlete.currentProgramName ? (
          <Text style={styles.programName}>{athlete.currentProgramName}</Text>
        ) : (
          <Text style={styles.emptyProgram}>Sin programación activa asignada.</Text>
        )}
      </Card>

      <Card style={styles.programCard}>
        <SectionHeader title="Planes asignados" subtitle="Personalizados y nutricionales" />
        {plansLoading ? (
          <ActivityIndicator color={colors.accent} />
        ) : assignedPlans.length === 0 ? (
          <Text style={styles.emptyProgram}>Todavía no has asignado planes a este atleta.</Text>
        ) : (
          assignedPlans.map((plan) => (
            <View key={plan.id} style={styles.planRow}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.planMeta}>{ATHLETE_PLAN_TYPE_LABELS[plan.planType]}</Text>
            </View>
          ))
        )}

        <View style={styles.planActions}>
          <Button
            title="Crear plan personalizado"
            variant="outline"
            onPress={() =>
              router.push({
                pathname: '/trainer/plan/create',
                params: { type: 'personalized', athleteId: athlete.id },
              })
            }
            style={styles.planActionBtn}
          />
          <Button
            title="Crear plan nutricional"
            variant="outline"
            onPress={() =>
              router.push({
                pathname: '/trainer/plan/create',
                params: { type: 'nutrition', athleteId: athlete.id },
              })
            }
            style={styles.planActionBtn}
          />
        </View>
      </Card>

      <Button
        title="Abrir chat"
        onPress={() => router.push({ pathname: '/trainer/chat/[id]', params: { id: athlete.id } })}
        style={styles.chatBtn}
      />
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
  loader: { marginTop: spacing.xl },
  error: { ...typography.body, color: colors.danger, textAlign: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${colors.accentBlue}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: colors.accentBlue },
  name: { ...typography.h2, color: colors.text },
  email: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  badge: { ...typography.bodySmall, fontWeight: '600' },
  programCard: { marginTop: spacing.md },
  programName: { ...typography.body, color: colors.text, fontWeight: '600' },
  emptyProgram: { ...typography.bodySmall, color: colors.textMuted },
  planRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  planTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  planMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  planActions: { gap: spacing.sm, marginTop: spacing.md },
  planActionBtn: { width: '100%' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { ...typography.body, color: colors.textSecondary },
  rowValue: { ...typography.body, color: colors.text, fontWeight: '500' },
  chatBtn: { marginTop: spacing.lg },
});
