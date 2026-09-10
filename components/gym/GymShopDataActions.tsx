import { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { PopoverMenu, type PopoverAnchor } from '@/components/ui/PopoverMenu';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import {
  exportGymShopProducts,
  pickAndParseGymShopProducts,
  type GymShopDataFormat,
  type GymShopImportRow,
} from '@/lib/gymShopDataTransfer';
import type { GymProduct } from '@/lib/gymTypes';

type MenuKind = 'import' | 'export' | null;

interface GymShopDataActionsProps {
  products: GymProduct[];
  fileStem: string;
  disabled?: boolean;
  onImport: (rows: GymShopImportRow[]) => Promise<{
    created: number;
    updated: number;
    failed: number;
    skipped: number;
    stockAdjusted: number;
  }>;
  onNotice: (message: string) => void;
  onError: (message: string) => void;
}

function DropdownButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: (anchor: PopoverAnchor) => void;
  disabled?: boolean;
}) {
  const ref = useRef<View>(null);

  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      onPress={() => {
        ref.current?.measureInWindow((x, y, width, height) => onPress({ x, y, width, height }));
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>{label}</Text>
      <AppIcon name="chevronDown" size={14} color={disabled ? colors.textMuted : colors.textSecondary} />
    </Pressable>
  );
}

export function GymShopDataActions({
  products,
  fileStem,
  disabled = false,
  onImport,
  onNotice,
  onError,
}: GymShopDataActionsProps) {
  const [menu, setMenu] = useState<{ kind: MenuKind; anchor: PopoverAnchor } | null>(null);
  const [busy, setBusy] = useState(false);

  const closeMenu = () => setMenu(null);

  const handleExport = async (format: GymShopDataFormat) => {
    closeMenu();
    if (products.length === 0) {
      onError('No hay productos para exportar.');
      return;
    }

    setBusy(true);
    const result = await exportGymShopProducts(products, format, fileStem);
    setBusy(false);
    if (result.error) onError(result.error);
    else onNotice(`Exportados ${result.data ?? products.length} productos en ${format === 'csv' ? 'CSV' : 'Excel'}.`);
  };

  const handleImport = async (format: GymShopDataFormat) => {
    closeMenu();
    setBusy(true);

    const picked = await pickAndParseGymShopProducts(format);
    if ('cancelled' in picked) {
      setBusy(false);
      return;
    }
    if ('error' in picked) {
      setBusy(false);
      onError(picked.error);
      return;
    }

    const summary = await onImport(picked.rows);
    setBusy(false);
    onNotice(
      `Importación completada: ${summary.created} creados` +
        (summary.updated ? `, ${summary.updated} actualizados` : '') +
        (summary.stockAdjusted ? `, ${summary.stockAdjusted} stocks ajustados` : '') +
        (summary.failed ? `, ${summary.failed} con error` : '') +
        (summary.skipped || picked.skipped ? `, ${summary.skipped + picked.skipped} filas omitidas` : '') +
        '.',
    );
  };

  const menuActions =
    menu?.kind === 'export'
      ? [
          { key: 'export-csv', label: 'CSV', onPress: () => void handleExport('csv') },
          { key: 'export-excel', label: 'Excel', onPress: () => void handleExport('excel') },
        ]
      : menu?.kind === 'import'
        ? [
            { key: 'import-csv', label: 'CSV', onPress: () => void handleImport('csv') },
            { key: 'import-excel', label: 'Excel', onPress: () => void handleImport('excel') },
          ]
        : [];

  return (
    <View style={styles.wrap}>
      <DropdownButton
        label={busy ? 'Procesando...' : 'Importar'}
        disabled={disabled || busy}
        onPress={(anchor) => setMenu({ kind: 'import', anchor })}
      />
      <DropdownButton
        label={busy ? 'Procesando...' : 'Exportar'}
        disabled={disabled || busy}
        onPress={(anchor) => setMenu({ kind: 'export', anchor })}
      />

      <PopoverMenu
        visible={menu !== null}
        anchor={menu?.anchor ?? null}
        title={
          menu?.kind === 'export'
            ? 'Exportar productos como'
            : menu?.kind === 'import'
              ? 'Importar desde'
              : undefined
        }
        actions={menuActions}
        onClose={closeMenu}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  buttonPressed: {
    backgroundColor: colors.surfaceLight,
  },
  buttonDisabled: {
    opacity: 0.55,
    ...(Platform.OS === 'web' ? ({ cursor: 'default' } as object) : null),
  },
  buttonText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  buttonTextDisabled: {
    color: colors.textMuted,
  },
});
