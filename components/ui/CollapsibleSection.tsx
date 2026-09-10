import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Card } from '@/components/ui/Card';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  /** Texto alineado a la derecha en la cabecera (p. ej. fecha). */
  headerMeta?: string;
  /** Segunda línea bajo la fecha (p. ej. pendiente de revisión). */
  headerStatus?: string;
  headerStatusTone?: 'default' | 'warning';
  /** Controles en la cabecera que no deben desplegar/contraer la sección. */
  headerActions?: ReactNode;
  children: ReactNode;
  style?: ViewStyle;
  defaultExpanded?: boolean;
  /** Si pasa a true, abre la sección (p. ej. cuando hay avisos pendientes). */
  autoExpand?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  tone?: 'default' | 'warning';
}

export function CollapsibleSection({
  title,
  subtitle,
  headerMeta,
  headerStatus,
  headerStatusTone = 'default',
  headerActions,
  children,
  style,
  defaultExpanded = false,
  autoExpand = false,
  expanded: expandedProp,
  onExpandedChange,
  tone = 'default',
}: CollapsibleSectionProps) {
  const isControlled = expandedProp !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = isControlled ? expandedProp : internalExpanded;
  const pending = tone === 'warning';

  const setExpanded = (next: boolean) => {
    if (!isControlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  useEffect(() => {
    if (autoExpand) setExpanded(true);
  }, [autoExpand]);

  return (
    <Card style={StyleSheet.flatten([style, pending && styles.cardPending])}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setExpanded(!expanded)}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={expanded ? `Contraer ${title}` : `Desplegar ${title}`}
          style={({ pressed }) => [styles.headerMain, pressed && styles.headerPressed]}
        >
          <View style={styles.headerText}>
            <Text style={[styles.title, pending && styles.titlePending]}>{title}</Text>
            {subtitle ? (
              <Text style={[styles.subtitle, pending && styles.subtitlePending]}>{subtitle}</Text>
            ) : null}
          </View>
        </Pressable>
        <View style={styles.headerTrailing}>
          {headerActions ? (
            <View
              onStartShouldSetResponder={() => true}
              onTouchEnd={(event) => event.stopPropagation()}
            >
              {headerActions}
            </View>
          ) : null}
          {headerMeta || headerStatus ? (
            <View style={styles.headerMetaCol}>
              {headerMeta ? <Text style={styles.headerMeta}>{headerMeta}</Text> : null}
              {headerStatus ? (
                <Text
                  style={[
                    styles.headerStatus,
                    headerStatusTone === 'warning' && styles.headerStatusWarning,
                  ]}
                >
                  {headerStatus}
                </Text>
              ) : null}
            </View>
          ) : null}
          <Pressable
            onPress={() => setExpanded(!expanded)}
            accessibilityRole="button"
            accessibilityLabel={expanded ? `Contraer ${title}` : `Desplegar ${title}`}
            hitSlop={8}
            style={({ pressed }) => [styles.chevronBtn, pressed && styles.headerPressed]}
          >
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {expanded ? <View style={styles.content}>{children}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  cardPending: {
    borderColor: colors.warning,
    backgroundColor: 'rgba(255, 179, 0, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerMain: {
    flex: 1,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  chevronBtn: {
    padding: 2,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  headerPressed: {
    opacity: 0.85,
  },
  headerText: {
    flex: 1,
  },
  headerTrailing: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerMetaCol: {
    alignItems: 'flex-end',
    maxWidth: 160,
    gap: 2,
    paddingTop: 2,
  },
  headerMeta: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'right',
  },
  headerStatus: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textAlign: 'right',
    lineHeight: 16,
  },
  headerStatusWarning: {
    color: colors.warning,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  titlePending: {
    color: colors.warning,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  subtitlePending: {
    color: colors.warning,
    fontWeight: '700',
  },
  content: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
