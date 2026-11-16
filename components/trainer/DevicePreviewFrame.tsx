import { useEffect, useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';

type DevicePlatform = 'ios' | 'android';

/** Fondo y color de la hora e iconos de la barra de estado del móvil. */
export type DeviceScreenColors = { background: string; content: string };

const SCREEN_BG = '#0F1419';
const DEFAULT_SCREEN_COLORS: DeviceScreenColors = { background: SCREEN_BG, content: '#F4F7FB' };

/** Tamaño real del marco. Luego se reduce para caber entero, sin recortar la pantalla. */
const PHONE_WIDTH = 418;
const PHONE_HEIGHT = 920;
const LABEL_HEIGHT = 32;

function previewScale(width: number, height: number, sideBySide: boolean) {
  const gap = sideBySide ? spacing.lg : 0;
  const chrome = LABEL_HEIGHT + (sideBySide ? 0 : 52);
  const slotWidth = Math.max((width - gap) / (sideBySide ? 2 : 1), 1);
  const slotHeight = Math.max(height - chrome - 8, 1);
  return Math.min(1, slotWidth / PHONE_WIDTH, slotHeight / PHONE_HEIGHT);
}

function useStatusClock() {
  const [label, setLabel] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const timer = setInterval(() => setLabel(formatClock(new Date())), 30_000);
    return () => clearInterval(timer);
  }, []);

  return label;
}

function formatClock(date: Date) {
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function SignalIcon({ color }: { color: string }) {
  const bar = [styles.signalBar, { backgroundColor: color }];
  return (
    <View style={styles.signal}>
      <View style={[bar, styles.signalBar1]} />
      <View style={[bar, styles.signalBar2]} />
      <View style={[bar, styles.signalBar3]} />
      <View style={[bar, styles.signalBar4]} />
    </View>
  );
}

function BatteryIcon({ color }: { color: string }) {
  return (
    <View style={[styles.battery, { borderColor: color }]}>
      <View style={[styles.batteryLevel, { backgroundColor: color }]} />
      <View style={[styles.batteryCap, { backgroundColor: color }]} />
    </View>
  );
}

function StatusIcons({ color }: { color: string }) {
  return (
    <View style={styles.statusIcons}>
      <SignalIcon color={color} />
      <BatteryIcon color={color} />
    </View>
  );
}

function DeviceStatusBar({ platform, screen }: { platform: DevicePlatform; screen: DeviceScreenColors }) {
  const time = useStatusClock();
  const ios = platform === 'ios';

  return (
    <View
      style={[
        styles.statusBar,
        ios ? styles.statusBarIos : styles.statusBarAndroid,
        { backgroundColor: screen.background },
      ]}
    >
      <Text style={[styles.statusTime, { color: screen.content }]}>{time}</Text>
      <View style={ios ? styles.island : styles.punchHole} />
      <StatusIcons color={screen.content} />
    </View>
  );
}

function DeviceHomeBar({ platform, screen }: { platform: DevicePlatform; screen: DeviceScreenColors }) {
  const ios = platform === 'ios';
  const customColors = screen !== DEFAULT_SCREEN_COLORS;

  return (
    <View style={[styles.homeBar, { backgroundColor: screen.background }]}>
      <View
        style={[
          ios ? styles.homePillIos : styles.homePillAndroid,
          customColors && { backgroundColor: screen.content, opacity: ios ? 1 : 0.7 },
        ]}
      />
    </View>
  );
}

function SideButtons({ platform }: { platform: DevicePlatform }) {
  if (platform === 'android') {
    return <View style={[styles.sideButton, styles.androidPower]} />;
  }

  return (
    <>
      <View style={[styles.sideButton, styles.iosVolumeUp]} />
      <View style={[styles.sideButton, styles.iosVolumeDown]} />
      <View style={[styles.sideButton, styles.iosPower]} />
    </>
  );
}

export function DevicePreviewFrame({
  platform,
  label,
  scale,
  screen = DEFAULT_SCREEN_COLORS,
  children,
}: {
  platform: DevicePlatform;
  label: string;
  scale: number;
  screen?: DeviceScreenColors;
  children: ReactNode;
}) {
  const ios = platform === 'ios';

  return (
    <View style={[styles.column, { width: PHONE_WIDTH * scale }]}>
      <Text style={styles.deviceLabel}>{label}</Text>
      <View style={[styles.scaler, { width: PHONE_WIDTH * scale, height: PHONE_HEIGHT * scale }]}>
        <View
          style={[
            styles.scaled,
            { width: PHONE_WIDTH, height: PHONE_HEIGHT, transform: [{ scale }] },
          ]}
        >
          <View style={[styles.bezel, ios ? styles.bezelIos : styles.bezelAndroid]}>
            <SideButtons platform={platform} />
            <View
              style={[
                styles.screen,
                ios ? styles.screenIos : styles.screenAndroid,
                { backgroundColor: screen.background },
              ]}
            >
              <DeviceStatusBar platform={platform} screen={screen} />
              <View style={styles.viewport}>{children}</View>
              <DeviceHomeBar platform={platform} screen={screen} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export function DevicePreviewPair({
  render,
  screen,
}: {
  render: () => ReactNode;
  screen?: DeviceScreenColors;
}) {
  const [box, setBox] = useState({ width: 1100, height: 640 });
  const [platform, setPlatform] = useState<DevicePlatform>('ios');
  const sideBySide = box.width >= 860;
  const scale = previewScale(box.width, box.height, sideBySide);

  return (
    <View
      style={[styles.row, !sideBySide && styles.rowStacked]}
      onLayout={(event) => {
        const nextWidth = Math.round(event.nativeEvent.layout.width);
        const nextHeight = Math.round(event.nativeEvent.layout.height);
        setBox((current) =>
          current.width === nextWidth && current.height === nextHeight
            ? current
            : { width: nextWidth, height: nextHeight },
        );
      }}
    >
      {sideBySide ? (
        <>
          <DevicePreviewFrame platform="ios" label="iPhone" scale={scale} screen={screen}>
            {render()}
          </DevicePreviewFrame>
          <DevicePreviewFrame platform="android" label="Android" scale={scale} screen={screen}>
            {render()}
          </DevicePreviewFrame>
        </>
      ) : (
        <>
          <View style={styles.switchRow}>
            <Pressable
              onPress={() => setPlatform('ios')}
              accessibilityRole="button"
              accessibilityState={{ selected: platform === 'ios' }}
              style={[styles.switchChip, platform === 'ios' && styles.switchChipActive]}
            >
              <Text style={[styles.switchText, platform === 'ios' && styles.switchTextActive]}>iPhone</Text>
            </Pressable>
            <Pressable
              onPress={() => setPlatform('android')}
              accessibilityRole="button"
              accessibilityState={{ selected: platform === 'android' }}
              style={[styles.switchChip, platform === 'android' && styles.switchChipActive]}
            >
              <Text style={[styles.switchText, platform === 'android' && styles.switchTextActive]}>
                Android
              </Text>
            </Pressable>
          </View>
          <DevicePreviewFrame
            platform={platform}
            label={platform === 'ios' ? 'iPhone' : 'Android'}
            scale={scale}
            screen={screen}
          >
            {render()}
          </DevicePreviewFrame>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  rowStacked: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  column: {
    alignItems: 'center',
    minWidth: 0,
  },
  scaler: {
    overflow: 'hidden',
  },
  scaled: {
    ...(Platform.OS === 'web' ? ({ transformOrigin: 'top left' } as object) : null),
  },
  deviceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.6,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  bezel: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 0,
    padding: 12,
    backgroundColor: '#16181C',
    borderWidth: 1,
    borderColor: '#3A3E46',
    position: 'relative',
  },
  bezelIos: {
    borderRadius: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bezelAndroid: {
    borderRadius: 28,
    padding: 10,
    backgroundColor: '#121418',
  },
  screen: {
    flex: 1,
    minHeight: 0,
    backgroundColor: SCREEN_BG,
    overflow: 'hidden',
  },
  screenIos: {
    borderRadius: 36,
  },
  screenAndroid: {
    borderRadius: 18,
  },
  viewport: {
    flex: 1,
    minHeight: 0,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  switchChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  switchChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  switchText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  switchTextActive: {
    color: colors.black,
  },
  statusBar: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    backgroundColor: SCREEN_BG,
  },
  statusBarIos: {
    height: 52,
  },
  statusBarAndroid: {
    height: 34,
    paddingHorizontal: 14,
  },
  statusTime: {
    color: '#F4F7FB',
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    minWidth: 48,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 48,
    justifyContent: 'flex-end',
  },
  island: {
    position: 'absolute',
    alignSelf: 'center',
    top: 12,
    width: 96,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#050506',
  },
  punchHole: {
    position: 'absolute',
    alignSelf: 'center',
    top: 11,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#050506',
    borderWidth: 2,
    borderColor: '#2A2E36',
  },
  signal: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 11,
  },
  signalBar: {
    width: 3,
    borderRadius: 1,
    backgroundColor: '#F4F7FB',
  },
  signalBar1: { height: 4 },
  signalBar2: { height: 6 },
  signalBar3: { height: 8 },
  signalBar4: { height: 11 },
  battery: {
    width: 22,
    height: 11,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#F4F7FB',
    padding: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryLevel: {
    width: 14,
    height: 7,
    borderRadius: 1,
    backgroundColor: '#F4F7FB',
  },
  batteryCap: {
    position: 'absolute',
    right: -3,
    width: 2,
    height: 4,
    borderRadius: 1,
    backgroundColor: '#F4F7FB',
  },
  homeBar: {
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SCREEN_BG,
  },
  homePillIos: {
    width: 118,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#F4F7FB',
  },
  homePillAndroid: {
    width: 86,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C5CDD6',
  },
  sideButton: {
    position: 'absolute',
    width: 3,
    borderRadius: 2,
    backgroundColor: '#4A4E56',
  },
  iosVolumeUp: {
    left: 4,
    top: 118,
    height: 28,
  },
  iosVolumeDown: {
    left: 4,
    top: 156,
    height: 28,
  },
  iosPower: {
    right: 4,
    top: 148,
    height: 52,
  },
  androidPower: {
    right: 4,
    top: 132,
    height: 42,
  },
});
