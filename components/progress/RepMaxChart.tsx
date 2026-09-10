import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, withAlpha } from '@/constants/theme';
import { formatRmValue, type RepMaxExerciseGroup } from '@/lib/repMax';
import {
  buildBodyMetricScale,
  chartExerciseLabel,
  chartUnitLabel,
  computeBodyMetricTrend,
  plotBodyMetricPoints,
  prepareRepMaxSeries,
} from '@/lib/repMaxChart';

const CHART_HEIGHT = 148;
const PLOT_PADDING_TOP = 8;
const PLOT_PADDING_BOTTOM = 4;

function LineSegment({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  if (length < 1) return null;

  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;

  return (
    <View
      style={[
        styles.lineSegment,
        {
          width: length,
          left: centerX - length / 2,
          top: centerY - 1,
          transform: [{ rotate: `${angle}deg` }],
        },
      ]}
    />
  );
}

function formatTrendValue(value: number, unit: string) {
  const rounded = Math.abs(value) >= 10 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded}${unit ? ` ${unit}` : ''}`;
}

export function RepMaxChart({
  groups,
  emptyText,
}: {
  groups: RepMaxExerciseGroup[];
  emptyText: string;
}) {
  const [selectedKey, setSelectedKey] = useState(groups[0]?.key ?? '');
  const [plotWidth, setPlotWidth] = useState(0);

  useEffect(() => {
    if (groups.length === 0) {
      setSelectedKey('');
      return;
    }
    if (!groups.some((group) => group.key === selectedKey)) {
      setSelectedKey(groups[0].key);
    }
  }, [groups, selectedKey]);

  const group = groups.find((item) => item.key === selectedKey) ?? groups[0];
  const unit = chartUnitLabel(group);
  const points = useMemo(() => prepareRepMaxSeries(group), [group]);
  const scale = useMemo(() => buildBodyMetricScale(points), [points]);
  const trend = useMemo(() => computeBodyMetricTrend(points), [points]);
  const plotted = useMemo(
    () =>
      plotWidth > 0
        ? plotBodyMetricPoints(points, plotWidth, CHART_HEIGHT, scale.min, scale.max)
        : [],
    [points, plotWidth, scale.min, scale.max],
  );

  const latest = points[points.length - 1];
  const usesEstimatedRm =
    group?.latest.unit === 'kg' &&
    [group.latest, ...group.history].some((entry) => entry.reps > 1);
  const trendColor =
    trend?.direction === 'up'
      ? colors.success
      : trend?.direction === 'down'
        ? colors.accent
        : colors.textMuted;

  const handlePlotLayout = (event: LayoutChangeEvent) => {
    setPlotWidth(event.nativeEvent.layout.width);
  };

  if (groups.length === 0) {
    return <Text style={styles.empty}>{emptyText}</Text>;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.chartTitle}>Evolución de RM</Text>
        {latest ? (
          <View style={styles.latestWrap}>
            <Text style={styles.latest}>
              {formatRmValue(latest.value)}
              {unit ? ` ${unit}` : ''}
            </Text>
            {trend && trend.direction !== 'flat' ? (
              <View style={[styles.trendBadge, { borderColor: `${trendColor}66` }]}>
                <Ionicons
                  name={trend.direction === 'up' ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={trendColor}
                />
                <Text style={[styles.trendText, { color: trendColor }]}>
                  {formatTrendValue(trend.delta, unit)}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {groups.length > 1 ? (
        <View style={styles.tabs}>
          {groups.map((item) => {
            const selected = item.key === group.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setSelectedKey(item.key)}
                style={[styles.tab, selected && styles.tabSelected]}
              >
                <Text style={[styles.tabText, selected && styles.tabTextSelected]} numberOfLines={1}>
                  {chartExerciseLabel(item, groups)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text style={styles.singleLift}>{chartExerciseLabel(group, groups)}</Text>
      )}

      <View style={styles.chart}>
        <View style={styles.yAxis}>
          {scale.ticks.map((tick) => (
            <Text key={tick} style={styles.yAxisLabel}>
              {tick >= 10 ? tick.toFixed(0) : tick.toFixed(1)}
            </Text>
          ))}
        </View>

        <View style={styles.plotColumn}>
          <View style={styles.plotArea} onLayout={handlePlotLayout}>
            {scale.ticks.map((tick, index) => {
              const y =
                CHART_HEIGHT -
                ((tick - scale.min) / Math.max(scale.max - scale.min, 0.001)) * CHART_HEIGHT;
              return (
                <View
                  key={`${tick}-${index}`}
                  style={[styles.gridLine, { top: y + PLOT_PADDING_TOP }]}
                />
              );
            })}

            <View
              style={[
                styles.plotSurface,
                { height: CHART_HEIGHT + PLOT_PADDING_TOP + PLOT_PADDING_BOTTOM },
              ]}
            >
              {plotted.map((point, index) => {
                const next = plotted[index + 1];
                return (
                  <View key={point.id}>
                    {next ? (
                      <LineSegment
                        x1={point.x}
                        y1={point.y + PLOT_PADDING_TOP}
                        x2={next.x}
                        y2={next.y + PLOT_PADDING_TOP}
                      />
                    ) : null}
                    <View
                      style={[
                        styles.dot,
                        index === plotted.length - 1 && styles.dotLatest,
                        {
                          left: point.x - (index === plotted.length - 1 ? 5 : 4),
                          top: point.y + PLOT_PADDING_TOP - (index === plotted.length - 1 ? 5 : 4),
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>
          </View>

          <View style={[styles.xAxis, plotWidth > 0 && { width: plotWidth }]}>
            {plotted.map((point, index) => {
              const showLabel =
                plotted.length <= 4 || index === 0 || index === plotted.length - 1 || index % 2 === 0;
              if (!showLabel) return null;
              return (
                <Text
                  key={point.id}
                  style={[
                    styles.xAxisLabel,
                    {
                      left: Math.max(0, Math.min(point.x - 22, plotWidth - 44)),
                      width: 44,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {point.label}
                </Text>
              );
            })}
          </View>
        </View>
      </View>

      {points.length === 1 ? (
        <Text style={styles.hint}>Registra otra marca para ver la tendencia.</Text>
      ) : usesEstimatedRm ? (
        <Text style={styles.hint}>El gráfico usa el 1RM estimado cuando la marca no es a 1 repetición.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  chartTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  latestWrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  latest: {
    ...typography.h3,
    color: colors.accent,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: colors.surface,
  },
  trendText: {
    ...typography.caption,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tab: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    maxWidth: '100%',
  },
  tabSelected: {
    borderColor: colors.accent,
    backgroundColor: withAlpha(colors.accent, '18'),
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextSelected: {
    color: colors.accent,
  },
  singleLift: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  chart: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  yAxis: {
    width: 34,
    height: CHART_HEIGHT + PLOT_PADDING_TOP + PLOT_PADDING_BOTTOM,
    justifyContent: 'space-between',
    paddingTop: PLOT_PADDING_TOP,
    paddingBottom: PLOT_PADDING_BOTTOM + 18,
  },
  yAxisLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    textAlign: 'right',
  },
  plotColumn: {
    flex: 1,
    minWidth: 0,
  },
  plotArea: {
    position: 'relative',
    height: CHART_HEIGHT + PLOT_PADDING_TOP + PLOT_PADDING_BOTTOM,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: withAlpha(colors.border, '88'),
  },
  plotSurface: {
    position: 'relative',
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: colors.accent,
    borderRadius: 1,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  dotLatest: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    borderColor: withAlpha(colors.accent, '44'),
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  xAxis: {
    position: 'relative',
    height: 18,
    marginTop: 4,
  },
  xAxisLabel: {
    position: 'absolute',
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
});
