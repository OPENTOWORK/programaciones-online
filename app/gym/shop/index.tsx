import { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { ensureMediaLibraryPickerAccess } from '@/lib/mediaLibraryPicker';
import {
  GymEmptyState,
  GymErrorBanner,
  GymScreen,
  GymScreenHeader,
  GymSectionTitle,
} from '@/components/gym/GymScreen';
import { GymMemberPickerField } from '@/components/gym/GymMemberPickerField';
import { GymShopSalePaymentFields } from '@/components/gym/GymShopSalePaymentFields';
import { GymShopDataActions } from '@/components/gym/GymShopDataActions';
import { GymShopSalesBalanceLink } from '@/components/gym/GymShopSalesBalance';
import { ShopProductThumbnail } from '@/components/gym/ShopProductThumbnail';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/hooks/useAuth';
import { useGym } from '@/hooks/useGym';
import { useGymMembers, useGymShop } from '@/hooks/useGymData';
import { gymFinanceAccountFromShopPayment, saveGymFinanceEntry } from '@/lib/gymFinance';
import {
  buildShopSaleNote,
  clearGymProductImage,
  deleteGymProduct,
  formatGymMoney,
  generateGymProductImage,
  GYM_SHOP_PAYMENT_METHOD_LABELS,
  gymShopInventoryValue,
  formatGymProductStockLabel,
  gymShopPhysicalStockUnits,
  isGymProductLowStock,
  isGymProductService,
  recordGymProductMovement,
  saveGymProduct,
  uploadGymProductImage,
  type GymShopSalePayment,
} from '@/lib/gymShopService';
import { findProductImportMatch, type GymShopImportRow } from '@/lib/gymShopDataTransfer';
import {
  GYM_PRODUCT_MOVEMENT_LABELS,
  type GymProduct,
  type GymProductInput,
  type GymProductMovementKind,
  gymMemberFullName,
  type GymMember,
} from '@/lib/gymTypes';

function todayKey() {
  const today = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

function parseMoney(value: string) {
  const parsed = Number(value.trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function formatMovementWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function pickProductImage() {
  const permission = await ensureMediaLibraryPickerAccess();
  if (!permission.granted) {
    return { error: 'Necesitamos permiso para acceder a tus fotos.' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]) return { cancelled: true as const };

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    mimeType: asset.mimeType ?? 'image/jpeg',
  };
}

type ProductImageChange = { uri: string; mimeType: string } | 'clear';
type ProductViewMode = 'list' | 'grid';

function ProductViewToggle({
  value,
  onChange,
}: {
  value: ProductViewMode;
  onChange: (mode: ProductViewMode) => void;
}) {
  return (
    <View style={styles.viewToggle}>
      <Pressable
        onPress={() => onChange('list')}
        accessibilityRole="button"
        accessibilityLabel="Vista en lista"
        accessibilityState={{ selected: value === 'list' }}
        style={({ pressed }) => [
          styles.viewToggleButton,
          value === 'list' && styles.viewToggleButtonActive,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="list"
          size={18}
          color={value === 'list' ? colors.black : colors.textMuted}
        />
      </Pressable>
      <Pressable
        onPress={() => onChange('grid')}
        accessibilityRole="button"
        accessibilityLabel="Vista en cuadrícula"
        accessibilityState={{ selected: value === 'grid' }}
        style={({ pressed }) => [
          styles.viewToggleButton,
          value === 'grid' && styles.viewToggleButtonActive,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="grid"
          size={18}
          color={value === 'grid' ? colors.black : colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

export default function GymShopScreen() {
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const { gym, permissions } = useGym();
  const { products, movements, isLoading, error, refresh } = useGymShop();
  const { members } = useGymMembers();

  const [editingProduct, setEditingProduct] = useState<GymProduct | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [movementProduct, setMovementProduct] = useState<GymProduct | null>(null);
  const [movementKind, setMovementKind] = useState<GymProductMovementKind>('sale');
  const [shopNotice, setShopNotice] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [productQuery, setProductQuery] = useState('');
  const [productViewMode, setProductViewMode] = useState<ProductViewMode>('list');

  const activeProducts = products.filter((product) => product.active);
  const lowStock = activeProducts.filter(isGymProductLowStock);
  const units = gymShopPhysicalStockUnits(activeProducts);
  const inventoryValue = gymShopInventoryValue(activeProducts);

  const sortedProducts = useMemo(
    () =>
      [...products].sort((a, b) => {
        if (a.active !== b.active) return a.active ? -1 : 1;
        const aLow = isGymProductLowStock(a) ? 0 : 1;
        const bLow = isGymProductLowStock(b) ? 0 : 1;
        if (aLow !== bLow) return aLow - bLow;
        return a.name.localeCompare(b.name, 'es');
      }),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const needle = productQuery.trim().toLowerCase();
    if (!needle) return sortedProducts;
    return sortedProducts.filter((product) => {
      const haystack = `${product.name} ${product.sku ?? ''} ${product.description ?? ''}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [productQuery, sortedProducts]);

  const openProduct = (product: GymProduct | null) => {
    if (!permissions.canManage) return;
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  const openMovement = (product: GymProduct, kind: GymProductMovementKind) => {
    setMovementProduct(product);
    setMovementKind(kind);
  };

  const handleAttachProductImage = async (product: GymProduct) => {
    if (!gym?.id || !permissions.canManage) return;

    const picked = await pickProductImage();
    if ('error' in picked && picked.error) {
      setShopNotice(null);
      setImportError(picked.error);
      return;
    }
    if (!('uri' in picked) || !picked.uri) return;

    setImportError(null);
    setShopNotice(`Subiendo imagen de ${product.name}…`);
    const uploaded = await uploadGymProductImage(
      gym.id,
      product.id,
      picked.uri,
      picked.mimeType,
      theme.id,
    );
    if (uploaded.error) {
      setShopNotice(null);
      setImportError(uploaded.error);
      return;
    }

    await refresh();
    setShopNotice(`Imagen actualizada para ${product.name}.`);
  };

  const handleImportProducts = async (rows: GymShopImportRow[]) => {
    if (!gym?.id) {
      return { created: 0, updated: 0, failed: rows.length, skipped: 0, stockAdjusted: 0 };
    }

    let created = 0;
    let updated = 0;
    let failed = 0;
    let stockAdjusted = 0;

    for (const row of rows) {
      const existing = findProductImportMatch(products, row);

      if (existing) {
        const result = await saveGymProduct(gym.id, {
          id: existing.id,
          name: row.name,
          description: row.description,
          sku: row.sku,
          price: row.price,
          stock: existing.stock,
          lowStockAlert: row.lowStockAlert,
          unit: row.unit,
          active: row.active,
        });
        if (result.error) {
          failed += 1;
          continue;
        }
        updated += 1;

        if (row.stock !== existing.stock && !isGymProductService(existing)) {
          const adjustment = await recordGymProductMovement({
            gymId: gym.id,
            productId: existing.id,
            kind: 'adjustment',
            quantity: row.stock,
            note: 'Importación de catálogo',
            createdBy: user?.id,
          });
          if (!adjustment.error) stockAdjusted += 1;
        }
        continue;
      }

      const result = await saveGymProduct(gym.id, {
        name: row.name,
        description: row.description,
        sku: row.sku,
        price: row.price,
        stock: row.stock,
        lowStockAlert: row.lowStockAlert,
        unit: row.unit,
        active: row.active ?? true,
      });
      if (result.error) {
        failed += 1;
        continue;
      }
      created += 1;
    }

    await refresh();
    return { created, updated, failed, skipped: 0, stockAdjusted };
  };

  return (
    <GymScreen>
      <ScreenWrapper>
        <GymScreenHeader title="Tienda" />

        {error ? <GymErrorBanner message={error} onRetry={refresh} /> : null}
        {importError ? <GymErrorBanner message={importError} onRetry={() => setImportError(null)} /> : null}
        {shopNotice ? <Text style={styles.notice}>{shopNotice}</Text> : null}

        <View style={styles.stats}>
          <StatCard label="Productos" value={String(activeProducts.length)} />
          <StatCard label="Unidades" value={String(units)} />
          <StatCard label="Valor stock" value={formatGymMoney(inventoryValue)} />
          <StatCard
            label="Stock bajo"
            value={String(lowStock.length)}
            warning={lowStock.length > 0}
          />
        </View>

        <GymSectionTitle
          title="Productos"
          count={productQuery.trim() ? filteredProducts.length : products.length}
        />
        <View style={styles.productActions}>
          {permissions.canManage ? (
            <>
              <Button
                title="Nuevo producto"
                variant="outline"
                size="compact"
                onPress={() => openProduct(null)}
                style={styles.addButton}
              />
              <GymShopDataActions
                products={products}
                fileStem={`${gym?.slug ?? 'tienda'}-productos`}
                disabled={!gym}
                onImport={handleImportProducts}
                onNotice={(message) => {
                  setImportError(null);
                  setShopNotice(message);
                }}
                onError={(message) => {
                  setShopNotice(null);
                  setImportError(message);
                }}
              />
            </>
          ) : null}
          <View style={styles.searchWrap}>
            <AppIcon name="search" size={16} color={colors.textMuted} />
            <TextInput
              value={productQuery}
              onChangeText={setProductQuery}
              placeholder="Buscar producto"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
          </View>
          <GymShopSalesBalanceLink movements={movements} />
          <ProductViewToggle value={productViewMode} onChange={setProductViewMode} />
        </View>

        {isLoading ? (
          <SkeletonBlock height={96} />
        ) : filteredProducts.length === 0 ? (
          <GymEmptyState
            icon="shop"
            title={productQuery.trim() ? 'Sin coincidencias' : 'Sin productos'}
            text={
              productQuery.trim()
                ? 'Prueba con otro nombre, referencia o descripción.'
                : 'Añade batidos, merchandising o material para llevar el recuento y los precios.'
            }
          />
        ) : productViewMode === 'grid' ? (
          <View style={styles.grid}>
            {filteredProducts.map((product) => {
              const low = isGymProductLowStock(product);
              const service = isGymProductService(product);
              return (
                <View key={product.id} style={styles.gridCard}>
                  <Pressable
                    onPress={() => openProduct(product)}
                    disabled={!permissions.canManage}
                    accessibilityRole={permissions.canManage ? 'button' : undefined}
                    accessibilityLabel={
                      permissions.canManage ? `Editar ${product.name}` : product.name
                    }
                    style={({ pressed }) => [
                      styles.gridCardMain,
                      pressed && permissions.canManage && styles.pressed,
                    ]}
                  >
                    <ShopProductThumbnail product={product} size={112} style={styles.gridThumb} />
                    <Text style={styles.gridTitle} numberOfLines={2}>
                      {product.name}
                      {!product.active ? ' · inactivo' : ''}
                    </Text>
                    <Text style={styles.gridMeta} numberOfLines={1}>
                      {formatGymMoney(product.price)}
                      {product.sku ? ` · ${product.sku}` : ''}
                    </Text>
                    <Text style={styles.gridMeta} numberOfLines={1}>
                      {formatGymProductStockLabel(product)}
                    </Text>
                    {low ? (
                      <Text style={styles.lowStock}>
                        Stock bajo (aviso a {product.lowStockAlert} {product.unit})
                      </Text>
                    ) : null}
                  </Pressable>
                  {permissions.canOperate && product.active ? (
                    <View style={styles.gridActions}>
                      {permissions.canManage ? (
                        <Pressable
                          onPress={() => void handleAttachProductImage(product)}
                          accessibilityRole="button"
                          accessibilityLabel={`Adjuntar imagen a ${product.name}`}
                          style={({ pressed }) => [
                            styles.attachImageBtn,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Ionicons name="image-outline" size={18} color={colors.textSecondary} />
                        </Pressable>
                      ) : null}
                      <Button
                        title="Vender"
                        size="compact"
                        onPress={() => openMovement(product, 'sale')}
                        disabled={!service && product.stock < 1}
                        style={styles.gridAction}
                      />
                      {service ? null : (
                        <Button
                          title="Entrada"
                          variant="outline"
                          size="compact"
                          onPress={() => openMovement(product, 'restock')}
                          style={styles.gridAction}
                        />
                      )}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.list}>
            {filteredProducts.map((product, index) => {
              const low = isGymProductLowStock(product);
              const service = isGymProductService(product);
              return (
                <View
                  key={product.id}
                  style={[styles.row, index === filteredProducts.length - 1 && styles.rowLast]}
                >
                  <Pressable
                    onPress={() => openProduct(product)}
                    disabled={!permissions.canManage}
                    accessibilityRole={permissions.canManage ? 'button' : undefined}
                    accessibilityLabel={
                      permissions.canManage ? `Editar ${product.name}` : product.name
                    }
                    style={({ pressed }) => [
                      styles.rowMain,
                      pressed && permissions.canManage && styles.pressed,
                    ]}
                  >
                    <ShopProductThumbnail product={product} size={68} />
                    <View style={styles.rowCopy}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {product.name}
                        {!product.active ? ' · inactivo' : ''}
                      </Text>
                      <Text style={styles.rowMeta} numberOfLines={2}>
                        {formatGymMoney(product.price)}
                        {product.sku ? ` · ${product.sku}` : ''}
                        {' · '}
                        {formatGymProductStockLabel(product)}
                        {product.description ? ` · ${product.description}` : ''}
                      </Text>
                      {low ? (
                        <Text style={styles.lowStock}>
                          Stock bajo (aviso a {product.lowStockAlert} {product.unit})
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                  {permissions.canOperate && product.active ? (
                    <View style={styles.rowActions}>
                      {permissions.canManage ? (
                        <Pressable
                          onPress={() => void handleAttachProductImage(product)}
                          accessibilityRole="button"
                          accessibilityLabel={`Adjuntar imagen a ${product.name}`}
                          style={({ pressed }) => [
                            styles.attachImageBtn,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Ionicons name="image-outline" size={20} color={colors.textSecondary} />
                        </Pressable>
                      ) : null}
                      <Button
                        title="Vender"
                        size="compact"
                        onPress={() => openMovement(product, 'sale')}
                        disabled={!service && product.stock < 1}
                        style={styles.rowAction}
                      />
                      {service ? null : (
                        <Button
                          title="Entrada"
                          variant="outline"
                          size="compact"
                          onPress={() => openMovement(product, 'restock')}
                          style={styles.rowAction}
                        />
                      )}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        <GymSectionTitle
          title="Movimientos"
          count={movements.length}
          subtitle="Ventas, entradas de mercancía y ajustes de inventario"
        />
        {isLoading ? (
          <SkeletonBlock height={80} />
        ) : movements.length === 0 ? (
          <GymEmptyState
            icon="stats"
            title="Sin movimientos"
            text="Cuando vendas o recibas stock, el recuento quedará aquí."
          />
        ) : (
          <View style={styles.list}>
            {movements.map((movement, index) => (
              <View
                key={movement.id}
                style={[styles.movementRow, index === movements.length - 1 && styles.rowLast]}
              >
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {GYM_PRODUCT_MOVEMENT_LABELS[movement.kind]}
                    {movement.productName ? ` · ${movement.productName}` : ''}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={2}>
                    {movement.kind === 'adjustment'
                      ? `Stock resultante: ${movement.quantity}`
                      : `${movement.quantity} ud`}
                    {movement.unitPrice !== undefined
                      ? ` · ${formatGymMoney(movement.unitPrice)}`
                      : ''}
                    {movement.kind === 'sale' && movement.unitPrice !== undefined
                      ? ` · total ${formatGymMoney(movement.unitPrice * movement.quantity)}`
                      : ''}
                    {movement.kind === 'sale' && movement.note?.trim()
                      ? ` · ${movement.note.trim()}`
                      : ''}
                    {movement.kind !== 'sale' && movement.note ? ` · ${movement.note}` : ''}
                  </Text>
                </View>
                <Text style={styles.when}>{formatMovementWhen(movement.createdAt)}</Text>
              </View>
            ))}
          </View>
        )}

        <ProductModal
          visible={productFormOpen}
          product={editingProduct}
          gymId={gym?.id ?? ''}
          themeId={theme.id}
          themeLabel={theme.label}
          onCancel={() => setProductFormOpen(false)}
          onSubmit={async (input, imageChange) => {
            if (!gym) return { error: 'No hay gimnasio activo.' };
            const result = await saveGymProduct(gym.id, { ...input, id: editingProduct?.id });
            if (result.error || !result.data) return result;

            if (imageChange === 'clear') {
              const cleared = await clearGymProductImage(gym.id, result.data.id);
              if (cleared.error) {
                return { error: `El producto se guardó, pero no se pudo quitar la imagen: ${cleared.error}` };
              }
            } else if (imageChange) {
              const uploaded = await uploadGymProductImage(
                gym.id,
                result.data.id,
                imageChange.uri,
                imageChange.mimeType,
                theme.id,
              );
              if (uploaded.error) {
                return { error: `El producto se guardó, pero la imagen no: ${uploaded.error}` };
              }
            }

            refresh();
            return result;
          }}
          onDelete={
            editingProduct
              ? async () => {
                  const result = await deleteGymProduct(editingProduct.id);
                  if (!result.error) refresh();
                  return result;
                }
              : undefined
          }
        />

        <MovementModal
          visible={Boolean(movementProduct)}
          product={movementProduct}
          initialKind={movementKind}
          canAdjust={permissions.canManage}
          members={members}
          onCancel={() => setMovementProduct(null)}
          onSubmit={async (input) => {
            if (!gym || !movementProduct) return { error: 'No hay gimnasio activo.' };
            const result = await recordGymProductMovement({
              gymId: gym.id,
              productId: movementProduct.id,
              kind: input.kind,
              quantity: input.quantity,
              unitPrice: input.unitPrice,
              note: input.note,
              createdBy: user?.id,
            });
            if (result.error) return result;

            if (
              input.kind === 'sale' &&
              input.payment?.status === 'paid' &&
              input.unitPrice &&
              input.payment.method
            ) {
              const amount = input.quantity * input.unitPrice;
              const methodLabel = GYM_SHOP_PAYMENT_METHOD_LABELS[input.payment.method];
              const financeResult = await saveGymFinanceEntry(
                gym.id,
                {
                  kind: 'income',
                  category: 'shop',
                  amount,
                  entryDate: todayKey(),
                  concept: `${movementProduct.name} · ${methodLabel}`,
                  counterparty: input.memberName,
                  account: gymFinanceAccountFromShopPayment(input.payment.method),
                },
                user?.id,
              );
              if (financeResult.error) return { error: financeResult.error };
            }

            refresh();
            return result;
          }}
        />
      </ScreenWrapper>
    </GymScreen>
  );
}

function StatCard({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <View style={[styles.stat, warning && styles.statWarning]}>
      <Text style={[styles.statValue, warning && styles.statValueWarning]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProductModal({
  visible,
  product,
  gymId,
  themeId,
  themeLabel,
  onCancel,
  onSubmit,
  onDelete,
}: {
  visible: boolean;
  product: GymProduct | null;
  gymId: string;
  themeId: import('@/constants/appThemes').AppThemeId;
  themeLabel: string;
  onCancel: () => void;
  onSubmit: (
    input: GymProductInput,
    imageChange?: ProductImageChange,
  ) => Promise<{ error?: string }>;
  onDelete?: () => Promise<{ error?: string }>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [lowStockAlert, setLowStockAlert] = useState('3');
  const [unit, setUnit] = useState('ud');
  const [active, setActive] = useState(true);
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [imageMime, setImageMime] = useState('image/jpeg');
  const [imageDirty, setImageDirty] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const serviceProduct = useMemo(
    () => isGymProductService({ name, sku }),
    [name, sku],
  );

  useEffect(() => {
    if (!visible) return;
    setName(product?.name ?? '');
    setDescription(product?.description ?? '');
    setSku(product?.sku ?? '');
    setPrice(product ? product.price.toFixed(2).replace('.', ',') : '');
    setStock(String(product?.stock ?? 0));
    setLowStockAlert(String(product?.lowStockAlert ?? 3));
    setUnit(product?.unit ?? 'ud');
    setActive(product?.active ?? true);
    setImageUri(product?.imageUrl);
    setImageMime('image/jpeg');
    setImageDirty(false);
    setGenerating(false);
    setError(null);
    setConfirmDelete(false);
  }, [product, visible]);

  const handleSubmit = async () => {
    if (!name.trim()) return setError('El nombre es obligatorio.');
    if (!price.trim()) return setError('Indica el precio del producto.');
    const priceValue = parseMoney(price);
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      return setError('Indica un precio válido.');
    }
    const stockValue = Number(stock);
    if (!product && (!Number.isInteger(stockValue) || stockValue < 0)) {
      return setError('El stock inicial no puede ser negativo.');
    }
    const alertValue = Number(lowStockAlert);
    if (!Number.isInteger(alertValue) || alertValue < 0) {
      return setError('El aviso de stock bajo no es válido.');
    }

    setSaving(true);
    setError(null);
    const imageChange: ProductImageChange | undefined = imageDirty
      ? imageUri
        ? { uri: imageUri, mimeType: imageMime }
        : 'clear'
      : undefined;
    const result = await onSubmit(
      {
        name,
        description,
        sku,
        price: priceValue,
        stock: product ? product.stock : serviceProduct ? 0 : stockValue,
        lowStockAlert: alertValue,
        unit,
        active,
      },
      imageChange,
    );
    setSaving(false);
    if (result.error) return setError(result.error);
    onCancel();
  };

  const handlePickImage = async () => {
    const picked = await pickProductImage();
    if ('error' in picked && picked.error) return setError(picked.error);
    if (!('uri' in picked) || !picked.uri) return;
    setImageUri(picked.uri);
    setImageMime(picked.mimeType);
    setImageDirty(true);
    setError(null);
  };

  const handleGenerateImage = async () => {
    if (!name.trim()) return setError('Escribe el nombre del producto para generar la imagen.');
    setGenerating(true);
    setError(null);
    const result = await generateGymProductImage({
      gymId,
      name,
      description,
      themeId,
    });
    setGenerating(false);
    if (result.error) return setError(result.error);
    if (!result.data) return setError('ChatGPT no devolvió ninguna imagen.');
    setImageUri(result.data.dataUrl);
    setImageMime(result.data.mimeType);
    setImageDirty(true);
  };

  const handleClearImage = () => {
    setImageUri(undefined);
    setImageDirty(true);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setSaving(true);
    setError(null);
    const result = await onDelete();
    setSaving(false);
    setConfirmDelete(false);
    if (result.error) return setError(result.error);
    onCancel();
  };

  return (
    <>
      <FormModal
        visible={visible}
        title={product ? 'Editar producto' : 'Nuevo producto'}
        subtitle={
          serviceProduct
            ? 'Servicio sin stock físico. Las ventas no descuentan inventario.'
            : product
              ? 'El stock se cambia con ventas, entradas o un ajuste.'
              : 'Nombre, precio y stock inicial para empezar a vender.'
        }
        error={error}
        saving={saving}
        onCancel={onCancel}
        onSubmit={() => void handleSubmit()}
      >
        <Input label="Nombre" value={name} onChangeText={setName} placeholder="Batido de proteínas" />
        <Input
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          placeholder="Opcional"
        />
        <Input
          label="Referencia"
          value={sku}
          onChangeText={setSku}
          placeholder="SKU o código de barras"
          autoCapitalize="characters"
        />
        <Input
          label="Precio (€)"
          value={price}
          onChangeText={setPrice}
          placeholder="12,90"
          keyboardType="decimal-pad"
        />
        {product || serviceProduct ? null : (
          <Input
            label="Stock inicial"
            value={stock}
            onChangeText={(value) => setStock(value.replace(/[^\d]/g, ''))}
            keyboardType="number-pad"
          />
        )}
        <Input
          label="Unidad"
          value={unit}
          onChangeText={setUnit}
          placeholder="ud"
        />
        {serviceProduct ? null : (
          <Input
            label="Avisar si el stock baja de"
            value={lowStockAlert}
            onChangeText={(value) => setLowStockAlert(value.replace(/[^\d]/g, ''))}
            keyboardType="number-pad"
          />
        )}
        <ToggleRow label="Activo" value={active} onChange={setActive} />
        <Text style={styles.label}>Imagen</Text>
        <Text style={styles.imageHint}>
          ChatGPT creará una foto profesional con fondo del tema {themeLabel.toLowerCase()}.
        </Text>
        <View style={styles.imageBlock}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} accessibilityLabel="Foto del producto" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <AppIcon name="camera" size={22} color={colors.textMuted} outlined />
              <Text style={styles.imagePlaceholderText}>Sube una foto o genérala con ChatGPT</Text>
            </View>
          )}
          <View style={styles.imageActions}>
            <Button
              title="Subir imagen"
              variant="outline"
              size="compact"
              onPress={() => void handlePickImage()}
              disabled={generating || saving}
              style={styles.imageAction}
            />
            <Button
              title={generating ? 'Generando…' : 'Generar con ChatGPT'}
              size="compact"
              onPress={() => void handleGenerateImage()}
              loading={generating}
              disabled={generating || saving}
              style={styles.imageAction}
            />
          </View>
          {imageUri ? (
            <Button
              title="Quitar imagen"
              variant="ghost"
              size="compact"
              onPress={handleClearImage}
              disabled={generating || saving}
              style={styles.clearImageButton}
            />
          ) : null}
        </View>
        {onDelete ? (
          <Button
            title="Eliminar producto"
            variant="ghost"
            onPress={() => setConfirmDelete(true)}
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
          />
        ) : null}
      </FormModal>
      <ConfirmModal
        visible={confirmDelete}
        title="Eliminar producto"
        message="Se borrará del catálogo y su historial de movimientos."
        confirmLabel="Eliminar"
        destructive
        busy={saving}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}

function MovementModal({
  visible,
  product,
  initialKind,
  canAdjust,
  members,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  product: GymProduct | null;
  initialKind: GymProductMovementKind;
  canAdjust: boolean;
  members: GymMember[];
  onCancel: () => void;
  onSubmit: (input: {
    kind: GymProductMovementKind;
    quantity: number;
    unitPrice?: number;
    note?: string;
    payment?: GymShopSalePayment;
    memberName?: string;
  }) => Promise<{ error?: string }>;
}) {
  const [kind, setKind] = useState<GymProductMovementKind>('sale');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [selectedMember, setSelectedMember] = useState<GymMember | null>(null);
  const [payment, setPayment] = useState<GymShopSalePayment>({ status: 'paid', method: 'cash' });
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = product ? isGymProductService(product) : false;
  const kinds: GymProductMovementKind[] = service
    ? ['sale']
    : canAdjust
      ? ['sale', 'restock', 'adjustment']
      : ['sale', 'restock'];

  useEffect(() => {
    if (!visible) return;
    setKind(initialKind);
    setQuantity(initialKind === 'adjustment' ? String(product?.stock ?? 1) : '1');
    setUnitPrice(product ? product.price.toFixed(2).replace('.', ',') : '');
    setSelectedMember(null);
    setPayment({ status: 'paid', method: 'cash' });
    setNote('');
    setError(null);
  }, [initialKind, product, visible]);

  const handleSubmit = async () => {
    const quantityValue = Number(quantity);
    if (!Number.isInteger(quantityValue) || quantityValue < 1) {
      return setError(
        kind === 'adjustment'
          ? 'El stock resultante debe ser al menos 1.'
          : 'La cantidad debe ser al menos 1.',
      );
    }
    if (kind === 'sale' && product && !service && quantityValue > product.stock) {
      return setError('No hay stock suficiente para esta venta.');
    }

    let priceValue: number | undefined;
    if (kind === 'sale') {
      priceValue = parseMoney(unitPrice);
      if (!Number.isFinite(priceValue) || priceValue < 0) {
        return setError('Indica el precio de venta.');
      }
    }

    if (kind === 'sale' && payment.status === 'paid' && !payment.method) {
      return setError('Indica si el pago fue en efectivo o con tarjeta.');
    }

    setSaving(true);
    setError(null);
    const saleNote =
      kind === 'sale'
        ? buildShopSaleNote(
            selectedMember ? gymMemberFullName(selectedMember) : undefined,
            payment,
            note,
          )
        : note.trim() || undefined;
    const result = await onSubmit({
      kind,
      quantity: quantityValue,
      unitPrice: priceValue,
      note: saleNote,
      payment: kind === 'sale' ? payment : undefined,
      memberName: selectedMember ? gymMemberFullName(selectedMember) : undefined,
    });
    setSaving(false);
    if (result.error) return setError(result.error);
    onCancel();
  };

  return (
    <FormModal
      visible={visible}
      title={product ? product.name : 'Movimiento'}
      subtitle={
        service
          ? 'Servicio sin stock físico · disponibilidad ilimitada'
          : kind === 'sale'
            ? `Stock actual: ${product?.stock ?? 0} ${product?.unit ?? 'ud'}`
            : kind === 'restock'
              ? 'Suma unidades al inventario.'
              : 'Deja el stock en la cantidad que indiques.'
      }
      error={error}
      saving={saving}
      submitTitle="Registrar"
      onCancel={onCancel}
      onSubmit={() => void handleSubmit()}
    >
      <Text style={styles.label}>Tipo</Text>
      <View style={styles.chips}>
        {kinds.map((item) => {
          const selected = kind === item;
          return (
            <Pressable
              key={item}
              onPress={() => {
                setKind(item);
                if (item === 'adjustment' && product) setQuantity(String(Math.max(product.stock, 1)));
                if (item !== 'adjustment' && quantity === String(product?.stock)) setQuantity('1');
              }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                {GYM_PRODUCT_MOVEMENT_LABELS[item]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Input
        label={kind === 'adjustment' ? 'Stock resultante' : 'Cantidad'}
        value={quantity}
        onChangeText={(value) => setQuantity(value.replace(/[^\d]/g, ''))}
        keyboardType="number-pad"
      />
      {kind === 'sale' ? (
        <Input
          label="Precio unitario (€)"
          value={unitPrice}
          onChangeText={setUnitPrice}
          keyboardType="decimal-pad"
        />
      ) : null}
      {kind === 'sale' ? (
        <GymMemberPickerField
          members={members}
          value={selectedMember}
          onChange={setSelectedMember}
        />
      ) : null}
      {kind === 'sale' ? (
        <GymShopSalePaymentFields payment={payment} onChange={setPayment} />
      ) : null}
      <Input
        label={kind === 'sale' ? 'Nota adicional' : 'Nota'}
        value={note}
        onChangeText={setNote}
        placeholder={kind === 'sale' ? 'Opcional · observaciones' : 'Opcional'}
      />
    </FormModal>
  );
}

function FormModal({
  visible,
  title,
  subtitle,
  error,
  saving,
  submitTitle = 'Guardar',
  onCancel,
  onSubmit,
  children,
}: {
  visible: boolean;
  title: string;
  subtitle: string;
  error: string | null;
  saving: boolean;
  submitTitle?: string;
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
            <Button title={submitTitle} onPress={onSubmit} loading={saving} style={styles.actionButton} />
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
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stat: {
    flexGrow: 1,
    flexBasis: 140,
    minWidth: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  statWarning: {
    borderColor: colors.danger,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
  },
  statValueWarning: {
    color: colors.danger,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  addButton: {
    alignSelf: 'flex-start',
    marginBottom: 0,
  },
  productActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 200,
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    minHeight: 40,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    ...typography.bodySmall,
    paddingVertical: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginLeft: 'auto',
    flexShrink: 0,
  },
  viewToggleButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  viewToggleButtonActive: {
    backgroundColor: colors.accent,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridCard: {
    flexGrow: 1,
    flexBasis: 180,
    minWidth: 168,
    maxWidth: 280,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  gridCardMain: {
    padding: spacing.sm,
    gap: spacing.xs,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  gridThumb: {
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  gridTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    minHeight: 36,
  },
  gridMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  gridActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.sm,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  gridAction: {
    flex: 1,
    minWidth: 0,
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
    marginBottom: spacing.sm,
  },
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    flexWrap: 'wrap',
  },
  movementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowLast: { borderBottomWidth: 0 },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 180,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
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
  lowStock: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '600',
    marginTop: 4,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
  attachImageBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  rowAction: {
    minWidth: 88,
  },
  when: {
    ...typography.caption,
    color: colors.textMuted,
    flexShrink: 0,
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
  imageHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  imageBlock: {
    marginBottom: spacing.md,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    marginBottom: spacing.sm,
  },
  imagePlaceholder: {
    height: 140,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  imagePlaceholderText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  imageActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  imageAction: {
    flexGrow: 1,
    minWidth: 140,
  },
  clearImageButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionButton: { flex: 1 },
  deleteButton: { alignSelf: 'flex-start', marginTop: spacing.xs },
  deleteButtonText: { color: colors.danger },
});
