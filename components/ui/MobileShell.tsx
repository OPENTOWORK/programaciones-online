import { Platform, StyleSheet, View } from 'react-native';

import {
  ATHLETE_COLORS_DEFAULT,
  ATHLETE_COLOR_OPTIONS,
  getAthleteColors,
  type AthleteColorsId,
} from '@/constants/athleteColors';
import { colors, scopedThemeContainerStyle, withAlpha } from '@/constants/theme';
import { AthleteColorsProvider } from '@/hooks/useAthleteColors';

const shellThemeStyles = Object.fromEntries(
  ATHLETE_COLOR_OPTIONS.map((option) => [
    option.id,
    scopedThemeContainerStyle(option.theme.palette, option.theme.scheme, option.brand),
  ]),
) as Record<AthleteColorsId, ReturnType<typeof scopedThemeContainerStyle>>;

const MOBILE_MAX_WIDTH = 430;

interface MobileShellProps {
  children: React.ReactNode;
  /** Sin el marco ancho de la web: la vista previa ya dibuja el teléfono. */
  bare?: boolean;
  /** Colores del marco; por defecto, los del atleta. */
  palette?: AthleteColorsId;
}

export function MobileShell({ children, bare = false, palette = ATHLETE_COLORS_DEFAULT }: MobileShellProps) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const themeStyle = shellThemeStyles[palette];

  return (
    <AthleteColorsProvider value={getAthleteColors(palette)}>
      {bare ? (
        <View style={[styles.bare, themeStyle]}>{children}</View>
      ) : (
        <View style={[styles.outer, themeStyle]}>
          <View style={styles.frame}>{children}</View>
        </View>
      )}
    </AthleteColorsProvider>
  );
}

export const mobileShellStyles = {
  maxWidth: MOBILE_MAX_WIDTH,
};

const styles = StyleSheet.create({
  bare: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 0,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  outer: {
    flex: 1,
    height: '100%',
    maxHeight: '100vh' as unknown as number,
    backgroundColor: colors.background,
    alignItems: 'center',
    overflow: 'hidden',
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: MOBILE_MAX_WIDTH,
    height: '100%',
    minHeight: 0,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
    flexDirection: 'column',
    ...(Platform.OS === 'web'
      ? { boxShadow: `0 0 40px ${withAlpha(colors.accent, '14')}` as unknown as undefined }
      : {}),
  },
});
