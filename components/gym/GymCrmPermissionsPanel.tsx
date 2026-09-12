import { StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { GYM_STAFF_ACCESS_TIER_LABELS, type GymStaffAccessTier } from '@/lib/gymTypes';

const PERMISSION_ROWS: Array<{ key: string; label: string; tiers: Record<GymStaffAccessTier, boolean> }> = [
  {
    key: 'settings',
    label: 'Configuración y usuarios',
    tiers: { administrador: true, comercial: false },
  },
  {
    key: 'finance',
    label: 'Finanzas y tarifas',
    tiers: { administrador: true, comercial: false },
  },
  {
    key: 'members',
    label: 'Miembros y CRM de potenciales',
    tiers: { administrador: true, comercial: true },
  },
  {
    key: 'bookings',
    label: 'Reservas, clases y agenda',
    tiers: { administrador: true, comercial: true },
  },
  {
    key: 'tasks',
    label: 'Tareas del equipo',
    tiers: { administrador: true, comercial: true },
  },
  {
    key: 'training',
    label: 'Entrenamientos publicados',
    tiers: { administrador: true, comercial: true },
  },
];

function PermissionCell({ allowed }: { allowed: boolean }) {
  return (
    <Text style={[styles.permissionCell, allowed ? styles.permissionYes : styles.permissionNo]}>
      {allowed ? 'Sí' : 'No'}
    </Text>
  );
}

export function GymCrmPermissionsPanel() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Permisos CRM</Text>
      <Text style={styles.lead}>
        Resumen de lo que puede hacer cada nivel dentro del panel del gimnasio.
      </Text>

      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.colPermission]}>Permiso</Text>
          <Text style={[styles.headerCell, styles.colTier]}>
            {GYM_STAFF_ACCESS_TIER_LABELS.administrador}
          </Text>
          <Text style={[styles.headerCell, styles.colTier]}>
            {GYM_STAFF_ACCESS_TIER_LABELS.comercial}
          </Text>
        </View>

        {PERMISSION_ROWS.map((row, index) => (
          <View
            key={row.key}
            style={[styles.bodyRow, index === PERMISSION_ROWS.length - 1 && styles.bodyRowLast]}
          >
            <Text style={[styles.cell, styles.colPermission]}>{row.label}</Text>
            <View style={styles.colTier}>
              <PermissionCell allowed={row.tiers.administrador} />
            </View>
            <View style={styles.colTier}>
              <PermissionCell allowed={row.tiers.comercial} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.lg,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  lead: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  table: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  headerCell: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 11,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  bodyRowLast: {
    borderBottomWidth: 0,
  },
  cell: {
    ...typography.bodySmall,
    color: colors.text,
  },
  colPermission: {
    flex: 1.6,
    minWidth: 0,
  },
  colTier: {
    flex: 0.7,
    minWidth: 72,
    alignItems: 'center',
  },
  permissionCell: {
    ...typography.bodySmall,
    fontWeight: '700',
  },
  permissionYes: {
    color: colors.accentBlue,
  },
  permissionNo: {
    color: colors.textMuted,
  },
});
