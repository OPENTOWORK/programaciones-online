import { useState } from 'react';

import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';



import { borderRadius, colors, spacing, typography, withAlpha } from '@/constants/theme';

import type { GymClass, GymClassType } from '@/lib/gymTypes';



const TIME_COL_WIDTH = 52;

const DAY_HEAD_HEIGHT = 34;

const GRID_START_MINUTES = 7 * 60;

const GRID_END_MINUTES = 22 * 60 + 30;



type LaidOutClass = {

  gymClass: GymClass;

  startMin: number;

  endMin: number;

  lane: number;

  lanes: number;

};



function minutesOfDay(iso: string) {

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return 0;

  return date.getHours() * 60 + date.getMinutes();

}



function formatClock(minutes: number) {

  const hours = Math.floor(minutes / 60);

  const mins = minutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

}



function formatRange(startIso: string, endIso: string) {

  return `${formatClock(minutesOfDay(startIso))}–${formatClock(minutesOfDay(endIso))}`;

}



function contrastText(background: string) {

  const hex = background.replace('#', '');

  if (hex.length < 6) return '#1A1A1A';

  const r = parseInt(hex.slice(0, 2), 16);

  const g = parseInt(hex.slice(2, 4), 16);

  const b = parseInt(hex.slice(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.58 ? '#1A1A1A' : '#FFFFFF';

}



function layoutDay(classes: readonly GymClass[]): LaidOutClass[] {

  const events = [...classes]

    .map((gymClass) => ({

      gymClass,

      startMin: minutesOfDay(gymClass.startAt),

      endMin: Math.max(minutesOfDay(gymClass.endAt), minutesOfDay(gymClass.startAt) + 30),

      lane: 0,

      lanes: 1,

    }))

    .sort((left, right) => left.startMin - right.startMin || left.endMin - right.endMin);



  const active: LaidOutClass[] = [];

  let cluster: LaidOutClass[] = [];

  let clusterMax = 0;



  const flush = () => {

    for (const item of cluster) item.lanes = Math.max(clusterMax, 1);

    cluster = [];

    clusterMax = 0;

  };



  for (const event of events) {

    for (let index = active.length - 1; index >= 0; index -= 1) {

      if (active[index].endMin <= event.startMin) active.splice(index, 1);

    }

    if (active.length === 0 && cluster.length > 0) flush();



    const used = new Set(active.map((item) => item.lane));

    let lane = 0;

    while (used.has(lane)) lane += 1;

    event.lane = lane;

    active.push(event);

    cluster.push(event);

    clusterMax = Math.max(clusterMax, active.length);

  }

  flush();

  return events;

}



function hourMarks(startMin: number, endMin: number) {

  const marks: number[] = [];

  for (let minute = startMin; minute <= endMin; minute += 60) marks.push(minute);

  return marks;

}



function renderBlock(

  item: LaidOutClass,

  gridStart: number,

  pxPerMinute: number,

  canOperate: boolean,

  onPressClass: ((gymClass: GymClass) => void) | undefined,

  positioned: boolean,

) {

  const fill = item.gymClass.classTypeColor ?? colors.surfaceLight;

  const ink = contrastText(fill);

  const full = item.gymClass.bookedCount >= item.gymClass.capacity;

  const cancelled = item.gymClass.status === 'cancelled';

  const title = item.gymClass.classTypeName ?? item.gymClass.title ?? 'Clase';

  const minHeight = Math.max(22, pxPerMinute * 28);

  const gap = 2;

  const laneWidth = 100 / item.lanes;

  const inset = item.lanes > 1 ? 1 : 2;



  return (

    <Pressable

      key={item.gymClass.id}

      onPress={() => onPressClass?.(item.gymClass)}

      accessibilityRole="button"

      accessibilityLabel={`${title} ${formatRange(item.gymClass.startAt, item.gymClass.endAt)}`}

      style={({ pressed }) => [

        positioned ? styles.block : styles.stackedCard,

        positioned

          ? {

              top: (item.startMin - gridStart) * pxPerMinute + gap,

              height: Math.max((item.endMin - item.startMin) * pxPerMinute - gap * 2, minHeight),

              left: `${item.lane * laneWidth}%`,

              width: `${laneWidth}%`,

              paddingLeft: inset,

              paddingRight: inset,

              backgroundColor: fill,

            }

          : { backgroundColor: fill },

        cancelled && styles.blockCancelled,

        pressed && canOperate && styles.pressed,

      ]}

    >

      <Text style={[styles.blockTitle, { color: ink }]} numberOfLines={1}>

        {title}

      </Text>

      <Text style={[styles.blockMeta, { color: ink }]} numberOfLines={1}>

        {positioned ? '' : `${formatRange(item.gymClass.startAt, item.gymClass.endAt)} · `}

        {item.gymClass.bookedCount}/{item.gymClass.capacity}

        {full ? ' · Completa' : ''}

      </Text>

    </Pressable>

  );

}



export function GymWeekTimetable({

  days,

  classesByDay,

  classTypes: _classTypes,

  wide,

  canOperate,

  onPressClass,

  onAddDay,

}: {

  days: Date[];

  classesByDay: Map<string, GymClass[]>;

  classTypes: readonly GymClassType[];

  wide: boolean;

  canOperate: boolean;

  onPressClass?: (gymClass: GymClass) => void;

  onAddDay?: (day: Date) => void;

}) {

  const today = new Date();

  const [bodyHeight, setBodyHeight] = useState(0);



  const allClasses = days.flatMap((day) => classesByDay.get(day.toDateString()) ?? []);

  const starts = allClasses.map((item) => minutesOfDay(item.startAt));

  const ends = allClasses.map((item) => minutesOfDay(item.endAt));

  const earliest = starts.length ? Math.min(...starts) : GRID_START_MINUTES;

  const latest = ends.length ? Math.max(...ends) : GRID_END_MINUTES;

  const gridStart = Math.min(GRID_START_MINUTES, Math.floor(earliest / 60) * 60);

  const gridEnd = Math.max(GRID_END_MINUTES, Math.ceil(latest / 60) * 60);

  const rangeMinutes = Math.max(gridEnd - gridStart, 60);

  const marks = hourMarks(gridStart, gridEnd);



  const availableHeight = Math.max(0, bodyHeight - DAY_HEAD_HEIGHT);

  const pxPerMinute = availableHeight > 0 ? availableHeight / rangeMinutes : 0.55;

  const gridHeight = availableHeight > 0 ? availableHeight : rangeMinutes * pxPerMinute;

  const fits = bodyHeight === 0 || gridHeight <= availableHeight + 1;



  const grid = (

    <View style={[styles.weekRow, !wide && styles.verticalDays]}>

      {wide ? (

        <View style={styles.timeAxis}>

          <View style={styles.dayHeadSpacer} />

          <View style={[styles.timeGutter, { height: gridHeight }]}>

            {marks.map((minute) => (

              <Text

                key={minute}

                style={[styles.timeLabel, { top: (minute - gridStart) * pxPerMinute - 6 }]}

              >

                {formatClock(minute)}

              </Text>

            ))}

          </View>

        </View>

      ) : null}



      {days.map((day) => {

        const dayClasses = classesByDay.get(day.toDateString()) ?? [];

        const laidOut = layoutDay(dayClasses);

        const isToday = day.toDateString() === today.toDateString();

        const weekday = day.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');



        return (

          <View key={day.toISOString()} style={wide ? styles.dayAxis : styles.stackedDay}>

            <View style={[styles.dayHead, !wide && styles.dayHeadStacked, isToday && styles.dayHeadToday]}>

              <Text style={[styles.dayName, isToday && styles.dayNameToday]} numberOfLines={1}>

                {weekday} {day.getDate()}

              </Text>

              {canOperate && onAddDay ? (

                <Pressable

                  onPress={() => onAddDay(day)}

                  hitSlop={8}

                  accessibilityLabel={`Añadir clase el ${day.toLocaleDateString('es-ES')}`}

                  style={({ pressed }) => [styles.addDayBtn, pressed && styles.pressed]}

                >

                  <Text style={styles.addDayText}>+</Text>

                </Pressable>

              ) : null}

            </View>



            <View

              style={[

                styles.dayCol,

                !wide && styles.dayColStacked,

                isToday && styles.dayColToday,

                wide ? { height: gridHeight } : null,

              ]}

            >

              {wide

                ? marks.map((minute) => (

                    <View

                      key={`${day.toISOString()}-${minute}`}

                      pointerEvents="none"

                      style={[styles.hourLine, { top: (minute - gridStart) * pxPerMinute }]}

                    />

                  ))

                : null}



              {wide

                ? laidOut.map((item) =>

                    renderBlock(item, gridStart, pxPerMinute, canOperate, onPressClass, true),

                  )

                : dayClasses.length === 0

                  ? <Text style={styles.dayEmpty}>Sin clases</Text>

                  : laidOut.map((item) =>

                      renderBlock(item, gridStart, pxPerMinute, canOperate, onPressClass, false),

                    )}

            </View>

          </View>

        );

      })}

    </View>

  );



  return (

    <View style={styles.wrap}>

      {wide ? (

        <View

          style={styles.gridBody}

          onLayout={(event) => {

            const next = Math.floor(event.nativeEvent.layout.height);

            if (next > 0 && next !== bodyHeight) setBodyHeight(next);

          }}

        >

          {fits ? grid : <ScrollView style={styles.fallbackScroll}>{grid}</ScrollView>}

        </View>

      ) : (

        <ScrollView style={styles.fallbackScroll} contentContainerStyle={styles.verticalDays}>

          {grid}

        </ScrollView>

      )}

    </View>

  );

}



const styles = StyleSheet.create({

  wrap: {

    flex: 1,

    minHeight: 0,

    borderWidth: 1,

    borderColor: colors.border,

    borderRadius: borderRadius.md,

    backgroundColor: colors.surface,

    overflow: 'hidden',

  },

  gridBody: {

    flex: 1,

    minHeight: 0,

    width: '100%',

  },

  weekRow: {

    flexDirection: 'row',

    flex: 1,

    width: '100%',

    alignItems: 'stretch',

  },

  verticalDays: {

    flexDirection: 'column',

    width: '100%',

  },

  fallbackScroll: {

    flex: 1,

  },

  timeAxis: {

    width: TIME_COL_WIDTH,

    flexShrink: 0,

  },

  timeGutter: {

    width: TIME_COL_WIDTH,

    position: 'relative',

  },

  timeLabel: {

    position: 'absolute',

    right: 6,

    ...typography.caption,

    color: colors.textMuted,

    fontSize: 10,

    fontWeight: '700',

    fontVariant: ['tabular-nums'],

  },

  dayAxis: {

    flex: 1,

    minWidth: 0,

  },

  stackedDay: {

    width: '100%',

  },

  dayHeadSpacer: {

    height: DAY_HEAD_HEIGHT,

    borderBottomWidth: 1,

    borderBottomColor: colors.border,

  },

  dayHead: {

    height: DAY_HEAD_HEIGHT,

    paddingHorizontal: 8,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    borderLeftWidth: 1,

    borderLeftColor: colors.border,

    borderBottomWidth: 1,

    borderBottomColor: colors.border,

    backgroundColor: colors.surface,

  },

  dayHeadStacked: {

    justifyContent: 'space-between',

    borderLeftWidth: 0,

  },

  dayHeadToday: {

    backgroundColor: withAlpha(colors.accent, '12'),

  },

  dayName: {

    ...typography.caption,

    color: colors.text,

    fontWeight: '800',

    textTransform: 'uppercase',

    letterSpacing: 0.3,

    fontSize: 11,

  },

  dayNameToday: {

    color: colors.accent,

  },

  addDayBtn: {

    position: 'absolute',

    right: 4,

    width: 16,

    height: 16,

    alignItems: 'center',

    justifyContent: 'center',

  },

  addDayText: {

    ...typography.caption,

    color: colors.textMuted,

    fontWeight: '800',

  },

  dayCol: {

    flex: 1,

    minWidth: 0,

    position: 'relative',

    borderLeftWidth: 1,

    borderLeftColor: colors.border,

    backgroundColor: colors.background,

  },

  dayColStacked: {

    width: '100%',

    minWidth: 0,

    height: undefined,

    padding: spacing.sm,

    gap: spacing.xs,

    borderLeftWidth: 0,

    borderBottomWidth: 1,

    borderBottomColor: colors.border,

  },

  dayColToday: {

    backgroundColor: withAlpha(colors.accent, '08'),

  },

  hourLine: {

    position: 'absolute',

    left: 0,

    right: 0,

    height: StyleSheet.hairlineWidth,

    backgroundColor: colors.border,

  },

  block: {

    position: 'absolute',

    paddingHorizontal: 5,

    paddingVertical: 2,

    borderRadius: 4,

    overflow: 'hidden',

    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),

  },

  blockCancelled: {

    opacity: 0.45,

  },

  blockTitle: {

    fontSize: 10,

    fontWeight: '800',

    letterSpacing: 0.15,

    textTransform: 'uppercase',

  },

  blockMeta: {

    fontSize: 9,

    fontWeight: '700',

    marginTop: 1,

    opacity: 0.82,

  },

  stackedCard: {

    borderRadius: borderRadius.sm,

    paddingHorizontal: spacing.sm,

    paddingVertical: spacing.sm,

  },

  dayEmpty: {

    ...typography.caption,

    color: colors.textMuted,

    fontStyle: 'italic',

    padding: spacing.sm,

  },

  pressed: { opacity: 0.82 },

});


