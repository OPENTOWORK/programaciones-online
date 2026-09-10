import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  getShopProductPlaceholderMeta,
  isShopProductPlaceholderPath,
} from '@/lib/gymShopProductArt';
import { resolveGymProductImageUrl } from '@/lib/gymShopService';
import type { GymProduct } from '@/lib/gymTypes';

interface ShopProductThumbnailProps {
  product: GymProduct;
  size?: number;
  style?: ViewStyle;
}

export function ShopProductThumbnail({ product, size = 64, style }: ShopProductThumbnailProps) {
  const { theme } = useAppTheme();
  const imageUrl = resolveGymProductImageUrl(product, theme.id);
  const showRemoteImage =
    Boolean(imageUrl) &&
    !isShopProductPlaceholderPath(product.imagePath) &&
    !imageUrl.startsWith('data:');

  if (showRemoteImage && imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: borderRadius.md },
          style,
        ]}
        accessibilityLabel={`Foto de ${product.name}`}
      />
    );
  }

  const meta = getShopProductPlaceholderMeta(product.name);

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          backgroundColor: meta.palette.bg,
          borderRadius: borderRadius.md,
        },
        style,
      ]}
      accessibilityLabel={`Imagen de ${product.name}`}
    >
      <View
        style={[
          styles.placeholderBadge,
          {
            backgroundColor: `${meta.palette.accent}33`,
            borderColor: `${meta.palette.accent}66`,
          },
        ]}
      >
        <Text style={[styles.placeholderBadgeText, { color: meta.palette.accent }]}>
          {meta.label}
        </Text>
      </View>
      <View style={styles.placeholderCopy}>
        {meta.lines.map((line) => (
          <Text
            key={line}
            numberOfLines={1}
            style={[styles.placeholderLine, { fontSize: Math.max(9, size * 0.11) }]}
          >
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function ShopProductThumbnailFallback({
  size = 64,
  style,
}: {
  size?: number;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        styles.empty,
        { width: size, height: size, borderRadius: borderRadius.md },
        style,
      ]}
    >
      <AppIcon name="shop" size={size > 56 ? 22 : 18} color={colors.textMuted} outlined />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surfaceLight,
  },
  placeholder: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 6,
    justifyContent: 'space-between',
  },
  placeholderBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  placeholderBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  placeholderCopy: {
    gap: 1,
  },
  placeholderLine: {
    color: colors.white,
    fontWeight: '700',
    lineHeight: 12,
  },
  empty: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
