import { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  GymEmptyState,
  GymErrorBanner,
  GymScreen,
  GymScreenHeader,
  GymSectionTitle,
} from '@/components/gym/GymScreen';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useGym } from '@/hooks/useGym';
import { useGymCatalog } from '@/hooks/useGymData';
import { saveGymClassType, deleteGymMembershipPlan, deleteGymPromotion, saveGymMembershipPlan, saveGymPromotion } from '@/lib/gymService';
import { formatGymMoney } from '@/lib/gymShopService';
import { isHypeGymCatalogTarget } from '@/lib/hypeGymRatesCatalog';
import {
  GYM_BILLING_PERIOD_LABELS,
  GYM_PROMOTION_DISCOUNT_TYPE_LABELS,
  formatPlanValidityLabel,
  type GymBillingPeriod,
  type GymClassType,
  type GymMembershipPlan,
  type GymPromotion,
  type GymPromotionDiscountType,
} from '@/lib/gymTypes';

const BILLING_ORDER: GymBillingPeriod[] = ['monthly', 'quarterly', 'annual', 'one_time'];
const DISCOUNT_ORDER: GymPromotionDiscountType[] = ['percentage', 'fixed', 'free_trial'];

function formatDiscount(promotion: GymPromotion) {
  if (promotion.discountType === 'free_trial') return 'Prueba gratis';
  if (promotion.discountType === 'percentage') {
    return `${promotion.discountValue ?? 0}%`;
  }
  return formatGymMoney(promotion.discountValue ?? 0);
}

function formatSessionsPerMonth(plan: GymMembershipPlan): string {
  if (!plan.maxBookings) {
    return 'Ilimitadas';
  }
  if (plan.billingPeriod === 'monthly') {
    return String(plan.maxBookings);
  }
  if (plan.billingPeriod === 'one_time') {
    return String(plan.maxBookings);
  }
  const monthsInPeriod = plan.billingPeriod === 'quarterly' ? 3 : 12;
  const perMonth = plan.maxBookings / monthsInPeriod;
  return Number.isInteger(perMonth) ? String(perMonth) : perMonth.toFixed(1).replace(/\.0$/, '');
}

export default function GymClassesScreen() {
  const { gym, permissions } = useGym();
  const {
    classTypes,
    plans,
    promotions,
    planActiveCounts,
    seedNotice,
    isLoading,
    error,
    refresh,
    reloadCatalog,
  } = useGymCatalog();

  const [editingType, setEditingType] = useState<GymClassType | null>(null);
  const [typeFormOpen, setTypeFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<GymMembershipPlan | null>(null);
  const [planFormOpen, setPlanFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<GymPromotion | null>(null);
  const [promotionFormOpen, setPromotionFormOpen] = useState(false);
  const [planFilter, setPlanFilter] = useState<'active' | 'all'>('active');
  const [promotionFilter, setPromotionFilter] = useState<'active' | 'all'>('active');
  const [pendingDeletePlan, setPendingDeletePlan] = useState<GymMembershipPlan | null>(null);
  const [deletePlanError, setDeletePlanError] = useState<string | null>(null);
  const [pendingDeletePromotion, setPendingDeletePromotion] = useState<GymPromotion | null>(null);
  const [deletePromotionError, setDeletePromotionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const visiblePlans = useMemo(
    () => (planFilter === 'active' ? plans.filter((plan) => plan.active) : plans),
    [planFilter, plans],
  );

  const visiblePromotions = useMemo(
    () =>
      promotionFilter === 'active'
        ? promotions.filter((promotion) => promotion.active)
        : promotions,
    [promotionFilter, promotions],
  );

  const showHypeCatalogAction = isHypeGymCatalogTarget(gym);

  const handleDeletePlan = async () => {
    if (!gym || !pendingDeletePlan) return;

    setBusy(true);
    setDeletePlanError(null);
    const result = await deleteGymMembershipPlan(gym.id, pendingDeletePlan.id);
    setBusy(false);

    if (result.error) {
      setPendingDeletePlan(null);
      setDeletePlanError(result.error);
      return;
    }

    setPendingDeletePlan(null);
    refresh();
  };

  const handleDeletePromotion = async () => {
    if (!gym || !pendingDeletePromotion) return;

    setBusy(true);
    setDeletePromotionError(null);
    const result = await deleteGymPromotion(gym.id, pendingDeletePromotion.id);
    setBusy(false);

    if (result.error) {
      setPendingDeletePromotion(null);
      setDeletePromotionError(result.error);
      return;
    }

    setPendingDeletePromotion(null);
    refresh();
  };

  return (
    <GymScreen>
      <ScreenWrapper>
        <GymScreenHeader
          title="Clases y tarifas"
          subtitle="Tipos de clase y precios de tus clientes"
        />

        {error ? <GymErrorBanner message={error} onRetry={refresh} /> : null}
        {seedNotice ? <Text style={styles.notice}>{seedNotice}</Text> : null}

        <GymSectionTitle
          title="Tipos de clase"
          count={classTypes.length}
          subtitle="Duración y aforo por defecto al programar el horario"
        />
        {permissions.canManage ? (
          <Button
            title="Nuevo tipo de clase"
            variant="outline"
            size="compact"
            onPress={() => {
              setEditingType(null);
              setTypeFormOpen(true);
            }}
            style={styles.addButton}
          />
        ) : null}

        {isLoading ? (
          <SkeletonBlock height={80} />
        ) : classTypes.length === 0 ? (
          <GymEmptyState
            icon="programs"
            title="Sin tipos de clase"
            text="Crea por ejemplo Cross Training, Funcional o Movilidad para reutilizarlos en el horario."
          />
        ) : (
          <View style={styles.list}>
            {classTypes.map((type, index) => (
              <Pressable
                key={type.id}
                onPress={() => {
                  if (!permissions.canManage) return;
                  setEditingType(type);
                  setTypeFormOpen(true);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Editar ${type.name}`}
                style={({ pressed }) => [
                  styles.row,
                  index === classTypes.length - 1 && styles.rowLast,
                  pressed && permissions.canManage && styles.pressed,
                ]}
              >
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {type.name}
                    {!type.active ? ' · inactivo' : ''}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {type.durationMinutes} min · {type.capacity} plazas
                    {type.description ? ` · ${type.description}` : ''}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <GymSectionTitle
          title="Tarifas de clientes"
          count={visiblePlans.length}
          subtitle="Lo que pagan tus miembros. No es la suscripción de tu gimnasio a Training ProgLine."
        />

        <View style={styles.sectionToolbar}>
          <FilterSelect
            value={planFilter}
            onChange={setPlanFilter}
            options={[
              { key: 'active', label: 'Mostrar activas' },
              { key: 'all', label: 'Mostrar todas' },
            ]}
          />
          <View style={styles.sectionActions}>
            {showHypeCatalogAction && permissions.canManage ? (
              <Button
                title="Cargar catálogo Hype"
                variant="ghost"
                size="compact"
                onPress={() => void reloadCatalog()}
              />
            ) : null}
            {permissions.canManage ? (
              <Button
                title="Crear tarifa"
                size="compact"
                onPress={() => {
                  setEditingPlan(null);
                  setPlanFormOpen(true);
                }}
              />
            ) : null}
          </View>
        </View>

        {isLoading ? (
          <SkeletonBlock height={180} />
        ) : visiblePlans.length === 0 ? (
          <GymEmptyState
            icon="goal"
            title="Sin tarifas"
            text="Define tus cuotas para poder asignarlas a cada miembro."
            action={
              showHypeCatalogAction && permissions.canManage ? (
                <Button title="Cargar catálogo Hype" variant="outline" size="compact" onPress={() => void reloadCatalog()} />
              ) : undefined
            }
          />
        ) : (
          <View style={styles.table}>
            {deletePlanError ? (
              <View style={styles.deleteNotice}>
                <Text style={styles.deleteNoticeText}>{deletePlanError}</Text>
                <Pressable
                  onPress={() => setDeletePlanError(null)}
                  accessibilityLabel="Cerrar aviso"
                  style={({ pressed }) => [styles.deleteNoticeClose, pressed && styles.pressed]}
                >
                  <AppIcon name="close" size={14} color={colors.textSecondary} />
                </Pressable>
              </View>
            ) : null}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.colName]}>Tarifa</Text>
              <Text style={[styles.headerCell, styles.colSessions]}>Sesiones al mes</Text>
              <Text style={[styles.headerCell, styles.colCount]}>Clientes activos</Text>
              <Text style={[styles.headerCell, styles.colPrice]}>Precio</Text>
              {permissions.canManage ? <View style={styles.colActions} /> : null}
            </View>

            {visiblePlans.map((plan, index) => (
              <Pressable
                key={plan.id}
                onPress={() => {
                  if (!permissions.canManage) return;
                  setEditingPlan(plan);
                  setPlanFormOpen(true);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Editar tarifa ${plan.name}`}
                style={({ pressed }) => [
                  styles.tableRow,
                  index === visiblePlans.length - 1 && styles.tableRowLast,
                  pressed && permissions.canManage && styles.pressed,
                ]}
              >
                <View style={styles.colName}>
                  <Text style={styles.rowTitle} numberOfLines={2}>
                    {plan.name}
                    {!plan.active ? ' · inactiva' : ''}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {[GYM_BILLING_PERIOD_LABELS[plan.billingPeriod], formatPlanValidityLabel(plan)]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <Text style={[styles.rowSessions, styles.colSessions]}>
                  {formatSessionsPerMonth(plan)}
                </Text>
                <Text style={[styles.rowCount, styles.colCount]}>{planActiveCounts[plan.id] ?? 0}</Text>
                <Text style={[styles.rowPrice, styles.colPrice]}>
                  {plan.price === undefined ? '—' : formatGymMoney(plan.price)}
                </Text>
                {permissions.canManage ? (
                  <View style={styles.colActions}>
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation?.();
                        setEditingPlan(plan);
                        setPlanFormOpen(true);
                      }}
                      accessibilityLabel={`Editar ${plan.name}`}
                      style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                    >
                      <AppIcon name="edit" size={16} color={colors.textSecondary} />
                    </Pressable>
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation?.();
                        const activeCount = planActiveCounts[plan.id] ?? 0;
                        if (activeCount > 0) {
                          setDeletePlanError(
                            `No se puede eliminar "${plan.name}": ${activeCount} cliente${activeCount === 1 ? '' : 's'} activo${activeCount === 1 ? '' : 's'}.`,
                          );
                          return;
                        }
                        setDeletePlanError(null);
                        setPendingDeletePlan(plan);
                      }}
                      accessibilityLabel={`Eliminar ${plan.name}`}
                      style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                    >
                      <AppIcon name="trash" size={16} color={colors.danger} />
                    </Pressable>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        )}

        <GymSectionTitle
          title="Descuentos"
          count={visiblePromotions.length}
          subtitle="Descuentos que puedes aplicar a las tarifas de tus clientes"
        />

        <View style={styles.sectionToolbar}>
          <FilterSelect
            value={promotionFilter}
            onChange={setPromotionFilter}
            options={[
              { key: 'active', label: 'Mostrar activos' },
              { key: 'all', label: 'Mostrar todos' },
            ]}
          />
          {permissions.canManage ? (
            <Button
              title="Crear descuento"
              size="compact"
              onPress={() => {
                setEditingPromotion(null);
                setPromotionFormOpen(true);
              }}
            />
          ) : null}
        </View>

        {isLoading ? (
          <SkeletonBlock height={140} />
        ) : visiblePromotions.length === 0 ? (
          <GymEmptyState
            icon="goal"
            title="Sin descuentos"
            text="Crea descuentos para staff, mañanas, founders u otros perfiles especiales."
            action={
              showHypeCatalogAction && permissions.canManage ? (
                <Button title="Cargar catálogo Hype" variant="outline" size="compact" onPress={() => void reloadCatalog()} />
              ) : undefined
            }
          />
        ) : (
          <View style={styles.table}>
            {deletePromotionError ? (
              <View style={styles.deleteNotice}>
                <Text style={styles.deleteNoticeText}>{deletePromotionError}</Text>
                <Pressable
                  onPress={() => setDeletePromotionError(null)}
                  accessibilityLabel="Cerrar aviso"
                  style={({ pressed }) => [styles.deleteNoticeClose, pressed && styles.pressed]}
                >
                  <AppIcon name="close" size={14} color={colors.textSecondary} />
                </Pressable>
              </View>
            ) : null}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.colDiscountName]}>Descuento</Text>
              <Text style={[styles.headerCell, styles.colDiscountAmount]}>Cantidad</Text>
              {permissions.canManage ? <View style={styles.colActions} /> : null}
            </View>

            {visiblePromotions.map((promotion, index) => (
              <Pressable
                key={promotion.id}
                onPress={() => {
                  if (!permissions.canManage) return;
                  setEditingPromotion(promotion);
                  setPromotionFormOpen(true);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Editar descuento ${promotion.name}`}
                style={({ pressed }) => [
                  styles.tableRow,
                  index === visiblePromotions.length - 1 && styles.tableRowLast,
                  pressed && permissions.canManage && styles.pressed,
                ]}
              >
                <View style={styles.colDiscountName}>
                  <Text style={styles.rowTitle} numberOfLines={2}>
                    {promotion.name}
                    {!promotion.active ? ' · inactivo' : ''}
                  </Text>
                  {promotion.description ? (
                    <Text style={styles.rowMeta} numberOfLines={1}>{promotion.description}</Text>
                  ) : null}
                </View>
                <View style={styles.colDiscountAmount}>
                  <View style={styles.discountPill}>
                    <Text style={styles.discountPillText}>{formatDiscount(promotion)}</Text>
                  </View>
                </View>
                {permissions.canManage ? (
                  <View style={styles.colActions}>
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation?.();
                        setEditingPromotion(promotion);
                        setPromotionFormOpen(true);
                      }}
                      accessibilityLabel={`Editar ${promotion.name}`}
                      style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                    >
                      <AppIcon name="edit" size={16} color={colors.textSecondary} />
                    </Pressable>
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation?.();
                        setDeletePromotionError(null);
                        setPendingDeletePromotion(promotion);
                      }}
                      accessibilityLabel={`Eliminar ${promotion.name}`}
                      style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                    >
                      <AppIcon name="trash" size={16} color={colors.danger} />
                    </Pressable>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        )}

        <ClassTypeModal
          visible={typeFormOpen}
          classType={editingType}
          onCancel={() => setTypeFormOpen(false)}
          onSubmit={async (input) => {
            if (!gym) return { error: 'No hay gimnasio activo.' };
            const result = await saveGymClassType(gym.id, { ...input, id: editingType?.id });
            if (!result.error) refresh();
            return result;
          }}
        />

        <PlanModal
          visible={planFormOpen}
          plan={editingPlan}
          onCancel={() => setPlanFormOpen(false)}
          onSubmit={async (input) => {
            if (!gym) return { error: 'No hay gimnasio activo.' };
            const result = await saveGymMembershipPlan(gym.id, { ...input, id: editingPlan?.id });
            if (!result.error) refresh();
            return result;
          }}
        />

        <ConfirmModal
          visible={Boolean(pendingDeletePlan)}
          title="¿Eliminar esta tarifa?"
          message={
            pendingDeletePlan
              ? `Se eliminará "${pendingDeletePlan.name}" del catálogo.`
              : ''
          }
          confirmLabel="Eliminar"
          destructive
          busy={busy}
          onCancel={() => setPendingDeletePlan(null)}
          onConfirm={() => void handleDeletePlan()}
        />

        <PromotionModal
          visible={promotionFormOpen}
          promotion={editingPromotion}
          onCancel={() => setPromotionFormOpen(false)}
          onSubmit={async (input) => {
            if (!gym) return { error: 'No hay gimnasio activo.' };
            const result = await saveGymPromotion(gym.id, { ...input, id: editingPromotion?.id });
            if (!result.error) refresh();
            return result;
          }}
        />

        <ConfirmModal
          visible={Boolean(pendingDeletePromotion)}
          title="¿Eliminar este descuento?"
          message={
            pendingDeletePromotion
              ? `Se eliminará "${pendingDeletePromotion.name}" del catálogo.`
              : ''
          }
          confirmLabel="Eliminar"
          destructive
          busy={busy}
          onCancel={() => setPendingDeletePromotion(null)}
          onConfirm={() => void handleDeletePromotion()}
        />
      </ScreenWrapper>
    </GymScreen>
  );
}

function FilterSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (next: T) => void;
  options: Array<{ key: T; label: string }>;
}) {
  return (
    <View style={styles.filterSelect}>
      {options.map((option) => {
        const selected = value === option.key;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={({ pressed }) => [
              styles.filterChip,
              selected && styles.filterChipActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PromotionModal({
  visible,
  promotion,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  promotion: GymPromotion | null;
  onCancel: () => void;
  onSubmit: (input: {
    name: string;
    description?: string;
    discountType: GymPromotionDiscountType;
    discountValue?: number;
    active?: boolean;
  }) => Promise<{ error?: string }>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<GymPromotionDiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(promotion?.name ?? '');
    setDescription(promotion?.description ?? '');
    setDiscountType(promotion?.discountType ?? 'percentage');
    setDiscountValue(
      promotion?.discountValue === undefined ? '' : String(promotion.discountValue),
    );
    setActive(promotion?.active ?? true);
    setError(null);
  }, [promotion, visible]);

  const handleSubmit = async () => {
    if (!name.trim()) return setError('El nombre es obligatorio.');

    const value = discountValue.trim() ? Number(discountValue.replace(',', '.')) : undefined;
    if (discountType !== 'free_trial' && (value === undefined || !Number.isFinite(value))) {
      return setError('Indica un valor de descuento válido.');
    }

    setSaving(true);
    setError(null);
    const result = await onSubmit({
      name,
      description,
      discountType,
      discountValue: discountType === 'free_trial' ? undefined : value,
      active,
    });
    setSaving(false);
    if (result.error) return setError(result.error);
    onCancel();
  };

  return (
    <FormModal
      visible={visible}
      title={promotion ? 'Editar descuento' : 'Nuevo descuento'}
      subtitle="Descuento aplicable a tarifas de clientes."
      error={error}
      saving={saving}
      onCancel={onCancel}
      onSubmit={() => void handleSubmit()}
    >
      <Input label="Nombre" value={name} onChangeText={setName} placeholder="Staff" />
      <Input
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholder="Opcional"
      />

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.chips}>
        {DISCOUNT_ORDER.map((type) => {
          const selected = discountType === type;
          return (
            <Pressable
              key={type}
              onPress={() => setDiscountType(type)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                {GYM_PROMOTION_DISCOUNT_TYPE_LABELS[type]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {discountType !== 'free_trial' ? (
        <Input
          label={discountType === 'percentage' ? 'Porcentaje (%)' : 'Importe (€)'}
          value={discountValue}
          onChangeText={setDiscountValue}
          keyboardType="decimal-pad"
        />
      ) : null}

      <ToggleRow label="Activo" value={active} onChange={setActive} />
    </FormModal>
  );
}

function ClassTypeModal({
  visible,
  classType,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  classType: GymClassType | null;
  onCancel: () => void;
  onSubmit: (input: {
    name: string;
    description?: string;
    durationMinutes: number;
    capacity: number;
    active?: boolean;
  }) => Promise<{ error?: string }>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60');
  const [capacity, setCapacity] = useState('12');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(classType?.name ?? '');
    setDescription(classType?.description ?? '');
    setDuration(String(classType?.durationMinutes ?? 60));
    setCapacity(String(classType?.capacity ?? 12));
    setActive(classType?.active ?? true);
    setError(null);
  }, [classType, visible]);

  const handleSubmit = async () => {
    const durationValue = Number(duration);
    const capacityValue = Number(capacity);

    if (!name.trim()) return setError('El nombre es obligatorio.');
    if (!Number.isFinite(durationValue) || durationValue < 5) {
      return setError('La duración debe ser de al menos 5 minutos.');
    }
    if (!Number.isFinite(capacityValue) || capacityValue < 1) {
      return setError('El aforo debe ser de al menos 1 plaza.');
    }

    setSaving(true);
    setError(null);
    const result = await onSubmit({
      name,
      description,
      durationMinutes: durationValue,
      capacity: capacityValue,
      active,
    });
    setSaving(false);

    if (result.error) return setError(result.error);
    onCancel();
  };

  return (
    <FormModal
      visible={visible}
      title={classType ? 'Editar tipo de clase' : 'Nuevo tipo de clase'}
      subtitle="Se usa como plantilla al programar el horario."
      error={error}
      saving={saving}
      onCancel={onCancel}
      onSubmit={() => void handleSubmit()}
    >
      <Input label="Nombre" value={name} onChangeText={setName} placeholder="Cross Training" />
      <Input
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholder="Opcional"
      />
      <Input
        label="Duración (minutos)"
        value={duration}
        onChangeText={(value) => setDuration(value.replace(/[^\d]/g, ''))}
        keyboardType="number-pad"
      />
      <Input
        label="Aforo"
        value={capacity}
        onChangeText={(value) => setCapacity(value.replace(/[^\d]/g, ''))}
        keyboardType="number-pad"
      />
      <ToggleRow label="Activo" value={active} onChange={setActive} />
    </FormModal>
  );
}

function PlanModal({
  visible,
  plan,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  plan: GymMembershipPlan | null;
  onCancel: () => void;
  onSubmit: (input: {
    name: string;
    description?: string;
    price?: number;
    billingPeriod: GymBillingPeriod;
    validityDays?: number;
    maxBookings?: number;
    active?: boolean;
  }) => Promise<{ error?: string }>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [billingPeriod, setBillingPeriod] = useState<GymBillingPeriod>('monthly');
  const [validityDays, setValidityDays] = useState('');
  const [maxBookings, setMaxBookings] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(plan?.name ?? '');
    setDescription(plan?.description ?? '');
    setPrice(plan?.price === undefined ? '' : String(plan.price));
    setBillingPeriod(plan?.billingPeriod ?? 'monthly');
    setValidityDays(plan?.validityDays === undefined ? '' : String(plan.validityDays));
    setMaxBookings(plan?.maxBookings === undefined ? '' : String(plan.maxBookings));
    setActive(plan?.active ?? true);
    setError(null);
  }, [plan, visible]);

  const handleSubmit = async () => {
    if (!name.trim()) return setError('El nombre es obligatorio.');

    const priceValue = price.trim() ? Number(price.replace(',', '.')) : undefined;
    if (priceValue !== undefined && !Number.isFinite(priceValue)) {
      return setError('El precio no es válido.');
    }

    const maxValue = maxBookings.trim() ? Number(maxBookings) : undefined;
    const validityValue = validityDays.trim() ? Number(validityDays) : undefined;
    if (validityValue !== undefined && (!Number.isFinite(validityValue) || validityValue <= 0)) {
      return setError('La caducidad debe ser un número de días mayor que cero.');
    }

    setSaving(true);
    setError(null);
    const result = await onSubmit({
      name,
      description,
      price: priceValue,
      billingPeriod,
      validityDays: validityValue,
      maxBookings: maxValue,
      active,
    });
    setSaving(false);

    if (result.error) return setError(result.error);
    onCancel();
  };

  return (
    <FormModal
      visible={visible}
      title={plan ? 'Editar tarifa' : 'Nueva tarifa'}
      subtitle="Cuota que paga el cliente a tu gimnasio."
      error={error}
      saving={saving}
      onCancel={onCancel}
      onSubmit={() => void handleSubmit()}
    >
      <Input label="Nombre" value={name} onChangeText={setName} placeholder="Cuota mensual" />
      <Input
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholder="Opcional"
      />
      <Input
        label="Precio (€)"
        value={price}
        onChangeText={setPrice}
        placeholder="Déjalo vacío si aún no lo defines"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Periodo</Text>
      <View style={styles.chips}>
        {BILLING_ORDER.map((period) => {
          const selected = billingPeriod === period;
          return (
            <Pressable
              key={period}
              onPress={() => setBillingPeriod(period)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                {GYM_BILLING_PERIOD_LABELS[period]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Input
        label="Caducidad (días)"
        value={validityDays}
        onChangeText={(value) => setValidityDays(value.replace(/[^\d]/g, ''))}
        placeholder="Vacío = según periodo"
        keyboardType="number-pad"
      />

      <Input
        label="Máximo de reservas"
        value={maxBookings}
        onChangeText={(value) => setMaxBookings(value.replace(/[^\d]/g, ''))}
        placeholder="Vacío = ilimitadas"
        keyboardType="number-pad"
      />
      <ToggleRow label="Activa" value={active} onChange={setActive} />
    </FormModal>
  );
}

function FormModal({
  visible,
  title,
  subtitle,
  error,
  saving,
  onCancel,
  onSubmit,
  children,
}: {
  visible: boolean;
  title: string;
  subtitle: string;
  error: string | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.card}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalSubtitle}>{subtitle}</Text>
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Button title="Cancelar" variant="secondary" onPress={onCancel} style={styles.actionButton} />
            <Button title="Guardar" onPress={onSubmit} loading={saving} style={styles.actionButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={({ pressed }) => [styles.toggleRow, pressed && styles.pressed]}
    >
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.toggleBox, value && styles.toggleBoxActive]}>
        {value ? <Text style={styles.toggleMark}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  notice: {
    ...typography.bodySmall,
    color: colors.text,
    backgroundColor: withAlpha(colors.accent, '14'),
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '4D'),
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionToolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterSelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  filterChipActive: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '14'),
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: colors.accent,
  },
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
        } as object)
      : null),
  },
  deleteNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: withAlpha(colors.danger, '10'),
    borderBottomWidth: 1,
    borderBottomColor: withAlpha(colors.danger, '22'),
  },
  deleteNoticeText: {
    ...typography.bodySmall,
    color: colors.danger,
    flex: 1,
    lineHeight: 20,
  },
  deleteNoticeClose: {
    padding: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: withAlpha(colors.accentBlue, '12'),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCell: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  tableRowLast: { borderBottomWidth: 0 },
  colName: { flex: 2.2, minWidth: 0 },
  colSessions: { width: 108, textAlign: 'center' },
  colCount: { width: 88, textAlign: 'right' },
  colPrice: { width: 92, textAlign: 'right' },
  colDiscountName: { flex: 2, minWidth: 0 },
  colDiscountAmount: { width: 110, alignItems: 'flex-start' },
  colActions: {
    width: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  rowCount: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  rowSessions: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  rowPrice: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  discountPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: withAlpha(colors.accent, '14'),
    borderWidth: 1,
    borderColor: withAlpha(colors.accent, '28'),
  },
  discountPillText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '800',
  },
  iconBtn: {
    padding: 6,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  row: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  rowLast: { borderBottomWidth: 0 },
  rowCopy: { minWidth: 0 },
  rowTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
  },
  rowMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  pressed: { opacity: 0.82 },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '88%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  modalTitle: { ...typography.h3, color: colors.text },
  modalSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  form: { flexGrow: 0 },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: colors.black },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  toggleLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  toggleBox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBoxActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  toggleMark: {
    ...typography.caption,
    color: colors.black,
    fontWeight: '800',
  },
  error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionButton: { flex: 1 },
});
