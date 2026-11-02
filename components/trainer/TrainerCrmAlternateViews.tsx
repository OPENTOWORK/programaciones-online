import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { crmViewStyles } from '@/components/crm/crmViewStyles';
import { AppIcon } from '@/components/ui/AppIcon';
import { CrmGymCard } from '@/components/trainer/CrmGymCard';
import { CrmLeadCard } from '@/components/trainer/CrmLeadCard';
import { borderRadius, colors, typography } from '@/constants/theme';
import { isCededClientStage, isGymsStage, isReadOnlyCrmStage } from '@/lib/trainerCrm';
import type { AdminGymRow } from '@/lib/gymAdminService';
import type { AthleteSummary, CrmStage } from '@/lib/types';

export interface TrainerCrmColumnView {
  stage: CrmStage;
  leads: AthleteSummary[];
  gyms?: AdminGymRow[];
}

interface TrainerCrmAlternateViewsProps {
  columns: TrainerCrmColumnView[];
  onOpenLead: (athleteId: string) => void;
  onOpenLeadActions: (athleteId: string, stageId: string) => void;
  onMoveLeadPrev: (athleteId: string) => void;
  onMoveLeadNext: (athleteId: string) => void;
  onDismissLeadAlerts: (athleteId: string) => void;
  onOpenGym: (gymId: string) => void;
}

function stageCanMove(column: TrainerCrmColumnView, columnIndex: number, columns: TrainerCrmColumnView[]) {
  const readOnly = isReadOnlyCrmStage(column.stage);
  return {
    readOnly,
    canMovePrev: !readOnly && columnIndex > 0,
    canMoveNext: !readOnly && columnIndex < columns.length - 1,
  };
}

function TrainerCrmListRow({
  title,
  meta,
  stageName,
  pendingCount,
  onPress,
  onOpenActions,
  bordered,
}: {
  title: string;
  meta: string;
  stageName: string;
  pendingCount?: number;
  onPress: () => void;
  onOpenActions?: () => void;
  bordered?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[crmViewStyles.listRow, bordered && crmViewStyles.listRowBorder]}
    >
      <View style={crmViewStyles.stagePill}>
        <Text style={crmViewStyles.stagePillText} numberOfLines={1}>
          {stageName}
        </Text>
      </View>
      <View style={crmViewStyles.listRowCopy}>
        <Text style={crmViewStyles.listRowTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={crmViewStyles.listRowMeta} numberOfLines={1}>
          {meta}
        </Text>
      </View>
      {pendingCount ? (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>{pendingCount > 99 ? '99+' : pendingCount}</Text>
        </View>
      ) : null}
      {onOpenActions ? (
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onOpenActions();
          }}
          hitSlop={6}
          style={crmViewStyles.iconBtn}
        >
          <AppIcon name="menuDots" size={16} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

export function TrainerCrmListView({
  columns,
  onOpenLead,
  onOpenLeadActions,
  onOpenGym,
}: TrainerCrmAlternateViewsProps) {
  return (
    <ScrollView style={crmViewStyles.scroll} contentContainerStyle={crmViewStyles.scrollContent}>
      {columns.map((column, columnIndex) => {
        const { readOnly } = stageCanMove(column, columnIndex, columns);
        const isGyms = isGymsStage(column.stage);
        const items = isGyms ? column.gyms ?? [] : column.leads;
        const count = items.length;

        return (
          <View key={column.stage.id} style={crmViewStyles.section}>
            <View style={crmViewStyles.sectionHead}>
              <Text style={crmViewStyles.sectionTitle}>{column.stage.name}</Text>
              <Text style={crmViewStyles.sectionCount}>{count}</Text>
            </View>

            {count === 0 ? (
              <Text style={crmViewStyles.sectionEmpty}>
                {isGyms ? 'Sin gimnasios todavía' : 'Sin atletas en esta columna'}
              </Text>
            ) : (
              <View style={crmViewStyles.list}>
                {isGyms
                  ? (column.gyms ?? []).map((row, index) => (
                      <TrainerCrmListRow
                        key={row.gym.id}
                        title={row.gym.name}
                        meta={row.gym.city ?? row.gym.email ?? 'Sin ubicación'}
                        stageName={column.stage.name}
                        onPress={() => onOpenGym(row.gym.id)}
                        bordered={index > 0}
                      />
                    ))
                  : column.leads.map((athlete, index) => (
                      <TrainerCrmListRow
                        key={athlete.id}
                        title={athlete.name}
                        meta={athlete.email}
                        stageName={column.stage.name}
                        pendingCount={athlete.alerts?.total ?? athlete.unansweredCount}
                        onPress={() => onOpenLead(athlete.id)}
                        onOpenActions={
                          readOnly && !isCededClientStage(column.stage)
                            ? undefined
                            : () => onOpenLeadActions(athlete.id, column.stage.id)
                        }
                        bordered={index > 0}
                      />
                    ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

export function TrainerCrmGridView({
  columns,
  onOpenLead,
  onOpenLeadActions,
  onMoveLeadPrev,
  onMoveLeadNext,
  onDismissLeadAlerts,
  onOpenGym,
}: TrainerCrmAlternateViewsProps) {
  return (
    <ScrollView style={crmViewStyles.scroll} contentContainerStyle={crmViewStyles.scrollContent}>
      <View style={crmViewStyles.grid}>
        {columns.flatMap((column, columnIndex) => {
          const { readOnly, canMovePrev, canMoveNext } = stageCanMove(column, columnIndex, columns);
          const isGyms = isGymsStage(column.stage);

          if (isGyms) {
            return (column.gyms ?? []).map((row) => (
              <View key={row.gym.id} style={crmViewStyles.gridItem}>
                <View style={[crmViewStyles.stagePill, crmViewStyles.gridStage]}>
                  <Text style={crmViewStyles.stagePillText} numberOfLines={1}>
                    {column.stage.name}
                  </Text>
                </View>
                <CrmGymCard row={row} onPress={() => onOpenGym(row.gym.id)} />
              </View>
            ));
          }

          return column.leads.map((athlete) => (
            <View key={athlete.id} style={crmViewStyles.gridItem}>
              <View style={[crmViewStyles.stagePill, crmViewStyles.gridStage]}>
                <Text style={crmViewStyles.stagePillText} numberOfLines={1}>
                  {column.stage.name}
                </Text>
              </View>
              <CrmLeadCard
                athlete={athlete}
                canMovePrev={canMovePrev}
                canMoveNext={canMoveNext}
                readOnly={readOnly}
                onPress={() => onOpenLead(athlete.id)}
                onMovePrev={() => onMoveLeadPrev(athlete.id)}
                onMoveNext={() => onMoveLeadNext(athlete.id)}
                onOpenActions={() => onOpenLeadActions(athlete.id, column.stage.id)}
                onDismissAlerts={() => onDismissLeadAlerts(athlete.id)}
              />
            </View>
          ));
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pendingBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  pendingBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 13,
  },
});
