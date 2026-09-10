import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type AppIconName =
  | 'home'
  | 'programs'
  | 'progress'
  | 'trainer'
  | 'profile'
  | 'strength'
  | 'hypertrophy'
  | 'mobility'
  | 'intense'
  | 'shred'
  | 'power'
  | 'plyo'
  | 'personal'
  | 'phase'
  | 'calendar'
  | 'goal'
  | 'frequency'
  | 'warmup'
  | 'main'
  | 'core'
  | 'cooldown'
  | 'trophy'
  | 'weight'
  | 'measure'
  | 'check'
  | 'streak'
  | 'info'
  | 'logo'
  | 'chat'
  | 'stats'
  | 'play'
  | 'time'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronDown'
  | 'moon'
  | 'sunny'
  | 'menuDots'
  | 'add'
  | 'close'
  | 'edit'
  | 'trash'
  | 'dragHandle'
  | 'search'
  | 'mic'
  | 'stop'
  | 'pause'
  | 'video'
  | 'camera'
  | 'templates'
  | 'support'
  | 'settings'
  | 'gym'
  | 'shop'
  | 'wallet'
  | 'tv'
  | 'colorPalette'
  | 'catalogBasico'
  | 'catalogCalistenia'
  | 'catalogAthx'
  | 'catalogCrosstraining'
  | 'catalogHype'
  | 'catalogHyrox'
  | 'catalogChallenge';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<AppIconName, { default: IoniconName; outline?: IoniconName }> = {
  home: { default: 'home', outline: 'home-outline' },
  programs: { default: 'list', outline: 'list-outline' },
  progress: { default: 'stats-chart', outline: 'stats-chart-outline' },
  trainer: { default: 'chatbubbles', outline: 'chatbubbles-outline' },
  profile: { default: 'person', outline: 'person-outline' },
  strength: { default: 'barbell' },
  hypertrophy: { default: 'fitness' },
  mobility: { default: 'body' },
  intense: { default: 'flame' },
  shred: { default: 'flash' },
  power: { default: 'rocket' },
  plyo: { default: 'arrow-up-circle' },
  personal: { default: 'star' },
  phase: { default: 'flag' },
  calendar: { default: 'calendar-outline' },
  goal: { default: 'flag-outline' },
  frequency: { default: 'repeat-outline' },
  warmup: { default: 'sunny-outline' },
  main: { default: 'barbell-outline' },
  core: { default: 'analytics-outline' },
  cooldown: { default: 'leaf-outline' },
  trophy: { default: 'trophy' },
  weight: { default: 'scale-outline' },
  measure: { default: 'resize-outline' },
  check: { default: 'checkmark-circle' },
  streak: { default: 'flame-outline' },
  info: { default: 'information-circle-outline' },
  logo: { default: 'barbell' },
  chat: { default: 'chatbubble-ellipses-outline' },
  stats: { default: 'trending-up-outline' },
  play: { default: 'play-circle-outline' },
  time: { default: 'time-outline' },
  chevronLeft: { default: 'chevron-back' },
  chevronRight: { default: 'chevron-forward' },
  chevronDown: { default: 'chevron-down' },
  moon: { default: 'moon', outline: 'moon-outline' },
  sunny: { default: 'sunny', outline: 'sunny-outline' },
  menuDots: { default: 'ellipsis-horizontal' },
  add: { default: 'add' },
  close: { default: 'close' },
  edit: { default: 'create-outline' },
  trash: { default: 'trash-outline' },
  dragHandle: { default: 'reorder-three-outline' },
  search: { default: 'search-outline' },
  mic: { default: 'mic', outline: 'mic-outline' },
  stop: { default: 'stop-circle', outline: 'stop-circle-outline' },
  pause: { default: 'pause-circle', outline: 'pause-circle-outline' },
  video: { default: 'videocam', outline: 'videocam-outline' },
  camera: { default: 'camera', outline: 'camera-outline' },
  templates: { default: 'albums', outline: 'albums-outline' },
  support: { default: 'help-buoy', outline: 'help-buoy-outline' },
  settings: { default: 'settings', outline: 'settings-outline' },
  gym: { default: 'business', outline: 'business-outline' },
  shop: { default: 'storefront', outline: 'storefront-outline' },
  wallet: { default: 'wallet', outline: 'wallet-outline' },
  tv: { default: 'tv', outline: 'tv-outline' },
  colorPalette: { default: 'color-palette', outline: 'color-palette-outline' },
  catalogBasico: { default: 'fitness-outline', outline: 'fitness-outline' },
  catalogCalistenia: { default: 'body-outline', outline: 'body-outline' },
  catalogAthx: { default: 'flash-outline', outline: 'flash-outline' },
  catalogCrosstraining: { default: 'stopwatch-outline', outline: 'stopwatch-outline' },
  catalogHype: { default: 'pulse-outline', outline: 'pulse-outline' },
  catalogHyrox: { default: 'medal-outline', outline: 'medal-outline' },
  catalogChallenge: { default: 'trophy-outline', outline: 'trophy-outline' },
};

export function resolveIconName(name: AppIconName, outlined = false): IoniconName {
  const icon = ICONS[name];
  if (outlined && icon.outline) return icon.outline;
  return icon.default;
}
