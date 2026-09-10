import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GymShopSalePaymentFields } from '@/components/gym/GymShopSalePaymentFields';
import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import {
  extractShopSaleExtraNote,
  formatGymMoney,
  parseShopSalePaymentNote,
  type GymShopSalePayment,
} from '@/lib/gymShopService';
import type { GymProductMovement } from '@/lib/gymTypes';

function parseMoney(value: string) {
  const parsed = Number(value.trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function GymMemberShopSaleModal({
  visible,
  sale,
  memberName,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  sale: GymProductMovement | null;
  memberName: string;
  onCancel: () => void;
  onSubmit: (input: {
    quantity: number;
    unitPrice: number;
    note?: string;
    payment: GymShopSalePayment;
  }) => Promise<{ error?: string }>;
}) {
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [payment, setPayment] = useState<GymShopSalePayment>({ status: 'pending' });
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible || !sale) return;
    const extra = extractShopSaleExtraNote(sale.note, memberName);
    const parsed = parseShopSalePaymentNote(extra);
    setQuantity(String(sale.quantity));
    setUnitPrice((sale.unitPrice ?? 0).toFixed(2).replace('.', ','));
    setPayment(parsed.payment);
    setNote(parsed.freeNote);
    setError(null);
  }, [memberName, sale, visible]);

  const handleSubmit = async () => {
    const quantityValue = Number(quantity);
    if (!Number.isInteger(quantityValue) || quantityValue < 1) {
      setError('La cantidad debe ser al menos 1.');
      return;
    }

    const priceValue = parseMoney(unitPrice);
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setError('Indica un precio válido.');
      return;
    }

    if (payment.status === 'paid' && !payment.method) {
      setError('Indica si el pago fue en efectivo o con tarjeta.');
      return;
    }

    setSaving(true);
    setError(null);
    const result = await onSubmit({
      quantity: quantityValue,
      unitPrice: priceValue,
      note: note.trim() || undefined,
      payment,
    });
    setSaving(false);
    if (result.error) setError(result.error);
  };

  const total =
    Number.isInteger(Number(quantity)) && Number(quantity) > 0 && Number.isFinite(parseMoney(unitPrice))
      ? Number(quantity) * parseMoney(unitPrice)
      : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.card}>
          <Text style={styles.title}>Editar compra</Text>
          <Text style={styles.subtitle}>
            {sale?.productName ?? 'Producto tienda'}
            {total !== null ? ` · ${formatGymMoney(total)}` : ''}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Input
              label="Cantidad"
              value={quantity}
              onChangeText={(value) => setQuantity(value.replace(/[^\d]/g, ''))}
              keyboardType="number-pad"
            />
            <Input
              label="Precio unitario (€)"
              value={unitPrice}
              onChangeText={setUnitPrice}
              keyboardType="decimal-pad"
            />
            <GymShopSalePaymentFields payment={payment} onChange={setPayment} />
            <Input
              label="Nota adicional"
              value={note}
              onChangeText={setNote}
              placeholder="Opcional · observaciones"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.actions}>
            <Button title="Cancelar" variant="secondary" onPress={onCancel} style={styles.action} />
            <Button title="Guardar" loading={saving} onPress={() => void handleSubmit()} style={styles.action} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
