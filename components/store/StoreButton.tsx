import { StyleSheet, type ViewStyle } from 'react-native';

import { Button } from '@/components/ui/Button';
import { fontUiBold } from '@/constants/fonts';
import { storeColors } from '@/constants/storeColors';

type StoreButtonTone = 'primary' | 'secondary' | 'outline' | 'ghost';

interface StoreButtonProps {
  title: string;
  onPress: () => void;
  tone?: StoreButtonTone;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

/** El botón de la app con los colores de las pantallas de compra. */
export function StoreButton({ title, onPress, tone = 'primary', loading, disabled, style }: StoreButtonProps) {
  return (
    <Button
      title={title}
      onPress={onPress}
      variant={tone === 'ghost' || tone === 'outline' ? tone : 'primary'}
      loading={loading}
      disabled={disabled}
      style={{ ...buttonStyles.base, ...buttonStyles[tone], ...style }}
      textStyle={{ ...labelStyles.base, ...labelStyles[tone] }}
    />
  );
}

const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: 12,
    minHeight: 46,
    shadowOpacity: 0,
    elevation: 0,
  },
  primary: {
    backgroundColor: storeColors.primary,
    borderColor: storeColors.primary,
  },
  secondary: {
    backgroundColor: storeColors.secondary,
    borderColor: storeColors.secondary,
  },
  outline: {
    backgroundColor: storeColors.background,
    borderColor: storeColors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
});

const labelStyles = StyleSheet.create({
  base: {
    fontFamily: fontUiBold,
    fontWeight: 'normal',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  primary: { color: '#FFFFFF' },
  secondary: { color: '#FFFFFF' },
  outline: { color: storeColors.primaryInk },
  ghost: { color: storeColors.primaryInk },
});
