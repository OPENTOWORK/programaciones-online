import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { brandColor, brandColors } from '@/constants/theme';

interface HorizontalPagerProps<T extends { id: string }> {
  items: readonly T[];
  renderPage: (item: T) => ReactNode;
  label: (item: T) => string;
  /** Si cambia, el carrusel se mueve a esa página. */
  activeIndex?: number;
}

export function HorizontalPager<T extends { id: string }>({
  items,
  renderPage,
  label,
  activeIndex,
}: HorizontalPagerProps<T>) {
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState({ width: 0, height: 0 });
  const [index, setIndex] = useState(0);

  if (items.length === 0) return null;

  const syncIndex = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (page.width <= 0) return;
    const next = Math.round(event.nativeEvent.contentOffset.x / page.width);
    setIndex(Math.min(Math.max(next, 0), items.length - 1));
  };

  const goTo = (next: number) => {
    if (page.width <= 0) return;
    scrollRef.current?.scrollTo({ x: next * page.width, animated: true });
    setIndex(next);
  };

  useEffect(() => {
    if (activeIndex == null || page.width <= 0) return;
    const next = Math.min(Math.max(activeIndex, 0), items.length - 1);
    scrollRef.current?.scrollTo({ x: next * page.width, animated: true });
    setIndex(next);
  }, [activeIndex, items.length, page.width]);

  return (
    <View style={styles.pager}>
      <View
        style={styles.viewport}
        onLayout={(event) => {
          const width = Math.round(event.nativeEvent.layout.width);
          const height = Math.round(event.nativeEvent.layout.height);
          setPage((current) =>
            current.width === width && current.height === height ? current : { width, height },
          );
        }}
      >
        {page.width > 0 && page.height > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={page.width}
            snapToAlignment="start"
            disableIntervalMomentum
            directionalLockEnabled
            scrollEventThrottle={16}
            onScroll={syncIndex}
            onMomentumScrollEnd={syncIndex}
            style={{ width: page.width, height: page.height }}
          >
            {items.map((item) => (
              <View key={item.id} style={{ width: page.width, height: page.height }}>
                {renderPage(item)}
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>
      {items.length > 1 ? (
        <View style={styles.dots}>
          {items.map((item, dotIndex) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Ver ${label(item)}`}
              onPress={() => goTo(dotIndex)}
              hitSlop={8}
              style={[styles.dot, dotIndex === index && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pager: {
    flex: 1,
    minHeight: 0,
    width: '100%',
  },
  viewport: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: brandColor('inactive', '#3A4150'),
  },
  dotActive: {
    width: 18,
    backgroundColor: brandColor('action', brandColors.orangeAction),
  },
});
