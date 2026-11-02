import { Platform, StyleSheet } from 'react-native';

import { borderRadius, colors, spacing, typography } from '@/constants/theme';

export const crmViewStyles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '800',
  },
  sectionCount: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '800',
  },
  sectionEmpty: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  listRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  listRowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  listRowTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  listRowMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  stagePill: {
    alignSelf: 'flex-start',
    maxWidth: 120,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  stagePillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridItem: {
    flexGrow: 1,
    padding: 4,
    minWidth: 260,
    maxWidth: Platform.OS === 'web' ? 360 : undefined,
  },
  gridStage: {
    marginBottom: spacing.xs,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
});
