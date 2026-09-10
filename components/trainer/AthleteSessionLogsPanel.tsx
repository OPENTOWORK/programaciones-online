import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AthleteSessionLogCalendar,
  sessionLogsForDate,
} from '@/components/trainer/AthleteSessionLogCalendar';
import { AthleteSessionLogCard } from '@/components/trainer/AthleteSessionLogCard';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useSessionLogFavorites } from '@/hooks/useSessionLogFavorites';
import type { useTrainerAthleteFeedback } from '@/hooks/useTrainerAthleteFeedback';
import type { SessionLogRecord } from '@/lib/sessionLogService';
import { pendingSessionLogIds } from '@/lib/sessionLogReview';
import { toLocalDateString } from '@/lib/sessionSchedule';

type SessionLogViewMode = 'list' | 'calendar';
type TrainerAthleteFeedbackState = ReturnType<typeof useTrainerAthleteFeedback>;

const SESSION_LOGS_PAGE_SIZE = 10;

function formatSelectedDayLabel(date: Date) {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function latestLogDate(logs: readonly SessionLogRecord[]) {
  if (logs.length === 0) return new Date();
  const sorted = [...logs].sort((left, right) => right.scheduledDate.localeCompare(left.scheduledDate));
  return new Date(`${sorted[0].scheduledDate}T12:00:00`);
}

export function SessionLogViewToggle({
  value,
  onChange,
}: {
  value: SessionLogViewMode;
  onChange: (mode: SessionLogViewMode) => void;
}) {
  return (
    <View style={styles.toggle}>
      <Pressable
        onPress={() => onChange('list')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'list' }}
        accessibilityLabel="Ver en lista"
        style={({ pressed }) => [
          styles.toggleBtn,
          value === 'list' && styles.toggleBtnActive,
          pressed && styles.toggleBtnPressed,
        ]}
      >
        <Ionicons
          name="list-outline"
          size={15}
          color={value === 'list' ? colors.black : colors.textSecondary}
        />
        <Text style={[styles.toggleText, value === 'list' && styles.toggleTextActive]}>Lista</Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('calendar')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'calendar' }}
        accessibilityLabel="Ver en calendario"
        style={({ pressed }) => [
          styles.toggleBtn,
          value === 'calendar' && styles.toggleBtnActive,
          pressed && styles.toggleBtnPressed,
        ]}
      >
        <Ionicons
          name="calendar-outline"
          size={15}
          color={value === 'calendar' ? colors.black : colors.textSecondary}
        />
        <Text style={[styles.toggleText, value === 'calendar' && styles.toggleTextActive]}>
          Calendario
        </Text>
      </Pressable>
    </View>
  );
}

interface AthleteSessionLogsPanelProps {
  logs: readonly SessionLogRecord[];
  loading: boolean;
  feedback: TrainerAthleteFeedbackState;
  viewMode: SessionLogViewMode;
  onViewModeChange: (mode: SessionLogViewMode) => void;
  onOpenLog: (logId: string) => void;
}

export function AthleteSessionLogsPanel({
  logs,
  loading,
  feedback,
  viewMode,
  onViewModeChange,
  onOpenLog,
}: AthleteSessionLogsPanelProps) {
  const [focusDate, setFocusDate] = useState(() => latestLogDate(logs));
  const [selectedDate, setSelectedDate] = useState(() => latestLogDate(logs));
  const [listPage, setListPage] = useState(0);
  const logIds = useMemo(() => logs.map((log) => log.id), [logs]);
  const pendingReviewLogIds = useMemo(
    () => pendingSessionLogIds(logIds, feedback),
    [feedback, logIds],
  );
  const { favoriteIds, isFavorite, toggleFavorite } = useSessionLogFavorites(logIds);
  const sortedLogs = useMemo(
    () => [...logs].sort((left, right) => right.scheduledDate.localeCompare(left.scheduledDate)),
    [logs],
  );

  useEffect(() => {
    const latest = latestLogDate(logs);
    setFocusDate(latest);
    setSelectedDate(latest);
    setListPage(0);
  }, [logs]);

  const listPageCount = Math.max(1, Math.ceil(sortedLogs.length / SESSION_LOGS_PAGE_SIZE));
  const safeListPage = Math.min(listPage, listPageCount - 1);
  const pagedLogs = useMemo(() => {
    const start = safeListPage * SESSION_LOGS_PAGE_SIZE;
    return sortedLogs.slice(start, start + SESSION_LOGS_PAGE_SIZE);
  }, [safeListPage, sortedLogs]);

  useEffect(() => {
    if (listPage !== safeListPage) {
      setListPage(safeListPage);
    }
  }, [listPage, safeListPage]);

  const selectedDayLogs = useMemo(
    () =>
      [...sessionLogsForDate(logs, selectedDate)].sort((left, right) =>
        left.scheduledDate.localeCompare(right.scheduledDate),
      ),
    [logs, selectedDate],
  );

  const renderLogCard = (log: SessionLogRecord, last: boolean) => (
    <AthleteSessionLogCard
      key={log.id}
      log={log}
      feedback={feedback}
      favorite={isFavorite(log.id)}
      last={last}
      onToggleFavorite={() => void toggleFavorite(log.id)}
      onPress={() => onOpenLog(log.id)}
    />
  );

  const renderLogStack = (items: readonly SessionLogRecord[]) => (
    <View style={styles.sessionStack}>
      {items.map((log, index) => renderLogCard(log, index === items.length - 1))}
    </View>
  );

  const renderListPagination = () => {
    if (sortedLogs.length <= SESSION_LOGS_PAGE_SIZE) return null;

    const from = safeListPage * SESSION_LOGS_PAGE_SIZE + 1;
    const to = Math.min((safeListPage + 1) * SESSION_LOGS_PAGE_SIZE, sortedLogs.length);

    return (
      <View style={styles.pagination}>
        <Pressable
          onPress={() => setListPage((page) => Math.max(0, page - 1))}
          disabled={safeListPage === 0}
          accessibilityRole="button"
          accessibilityLabel="Página anterior"
          style={({ pressed }) => [
            styles.paginationBtn,
            safeListPage === 0 && styles.paginationBtnDisabled,
            pressed && safeListPage > 0 && styles.paginationBtnPressed,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={safeListPage === 0 ? colors.textMuted : colors.text}
          />
          <Text
            style={[
              styles.paginationBtnText,
              safeListPage === 0 && styles.paginationBtnTextDisabled,
            ]}
          >
            Anterior
          </Text>
        </Pressable>

        <Text style={styles.paginationMeta}>
          {from}–{to} de {sortedLogs.length} · Página {safeListPage + 1}/{listPageCount}
        </Text>

        <Pressable
          onPress={() => setListPage((page) => Math.min(listPageCount - 1, page + 1))}
          disabled={safeListPage >= listPageCount - 1}
          accessibilityRole="button"
          accessibilityLabel="Página siguiente"
          style={({ pressed }) => [
            styles.paginationBtn,
            safeListPage >= listPageCount - 1 && styles.paginationBtnDisabled,
            pressed && safeListPage < listPageCount - 1 && styles.paginationBtnPressed,
          ]}
        >
          <Text
            style={[
              styles.paginationBtnText,
              safeListPage >= listPageCount - 1 && styles.paginationBtnTextDisabled,
            ]}
          >
            Siguiente
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={safeListPage >= listPageCount - 1 ? colors.textMuted : colors.text}
          />
        </Pressable>
      </View>
    );
  };

  const viewToggle = logs.length > 0 ? (
    <View style={styles.viewToggleWrap}>
      <SessionLogViewToggle value={viewMode} onChange={onViewModeChange} />
    </View>
  ) : null;

  if (loading) {
    return (
      <View style={styles.panelWrap}>
        {viewToggle}
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (logs.length === 0) {
    return (
      <View style={styles.panelWrap}>
        <Text style={styles.emptyText}>Todavía no hay sesiones registradas desde el calendario.</Text>
      </View>
    );
  }

  if (viewMode === 'list') {
    return (
      <View style={styles.panelWrap}>
        {viewToggle}
        <View style={styles.listWrap}>
          {renderLogStack(pagedLogs)}
          {renderListPagination()}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.panelWrap}>
      {viewToggle}
      <View style={styles.calendarWrap}>
      <AthleteSessionLogCalendar
        logs={logs}
        favoriteIds={favoriteIds}
        pendingReviewLogIds={pendingReviewLogIds}
        focusDate={focusDate}
        onFocusDateChange={setFocusDate}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <View style={styles.selectedDayHeader}>
        <View style={styles.selectedDayTitleWrap}>
          <Text style={styles.selectedDayTitle}>{formatSelectedDayLabel(selectedDate)}</Text>
          {selectedDayLogs.some((log) => pendingReviewLogIds.has(log.id)) ? (
            <View style={styles.pendingPill}>
              <Text style={styles.pendingPillText}>Por revisar</Text>
            </View>
          ) : null}
        </View>
        <Pressable onPress={() => onViewModeChange('list')} hitSlop={8}>
          <Text style={styles.viewAllLink}>Ver todo en lista</Text>
        </Pressable>
      </View>

      {selectedDayLogs.length === 0 ? (
        <Text style={styles.emptyDayText}>
          No hay registro de entreno el {toLocalDateString(selectedDate)}.
        </Text>
      ) : (
        renderLogStack(selectedDayLogs)
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    padding: 2,
    gap: 2,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  toggleBtnActive: {
    backgroundColor: colors.accent,
  },
  toggleBtnPressed: {
    opacity: 0.88,
  },
  toggleText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: colors.black,
  },
  panelWrap: {
    gap: spacing.sm,
  },
  viewToggleWrap: {
    alignSelf: 'flex-end',
  },
  listWrap: {
    gap: spacing.sm,
  },
  sessionStack: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  paginationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  paginationBtnDisabled: {
    opacity: 0.45,
    ...(Platform.OS === 'web' ? ({ cursor: 'default' } as object) : null),
  },
  paginationBtnPressed: {
    opacity: 0.82,
  },
  paginationBtnText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  paginationBtnTextDisabled: {
    color: colors.textMuted,
  },
  paginationMeta: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  calendarWrap: {
    gap: spacing.md,
  },
  selectedDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  selectedDayTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  selectedDayTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  pendingPill: {
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: withAlpha(colors.warning, '18'),
  },
  pendingPillText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.2,
  },
  viewAllLink: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  emptyDayText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
