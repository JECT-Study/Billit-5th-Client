import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { TripFeaturedCard } from '@/features/trip/list/components/TripFeaturedCard';
import type { TripListItem } from '@/features/trip/list/tripListSchema';
import { COLORS, RADIUS, SHADOW } from '@/theme/theme.generated';

const CARD_HEIGHT = 172;
// Figma: 뒤에 깔린 카드는 -5.07° 기울고 왼쪽으로 10px 치우친다 (3227:83943)
const BACKDROP_ROTATION = '-5.07deg';
const BACKDROP_OFFSET_X = -10;
// 이만큼 끌거나 빠르게 던지면 다음 카드로 넘어간다
const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 0.6;
// 앞 카드를 이만큼 끌면 뒤 카드가 완전히 앞 자리로 올라온다
const FULL_PROGRESS_DISTANCE = 140;
const SWIPE_OUT_DURATION = 320;
const BACKDROP_ENTRY_DURATION = 100;

type TripCardStackProps = {
  trips: TripListItem[];
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  onPressTrip: (trip: TripListItem) => void;
};

/**
 * 진행중 여행 카드 덱.
 * - 1장: 카드만 보여준다 (뒤 레이어, 스와이프 없음)
 * - 2장 이상: 앞 카드 뒤에 기울어진 카드 레이어가 깔리고, 옆으로 넘기면
 *   앞 카드가 밀려나면서 뒤 카드가 앞으로 올라온다.
 * - 마지막 카드 다음에는 처음 카드가 새 뒤 레이어로 부드럽게 다시 깔린다.
 */
export function TripCardStack({
  trips,
  activeIndex,
  onChangeIndex,
  onPressTrip,
}: TripCardStackProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [dragX] = useState(() => new Animated.Value(0));
  const [backdropEntry] = useState(() => new Animated.Value(1));
  const hasMountedRef = useRef(false);
  const trip = trips[activeIndex];
  const count = trips.length;
  const hasStack = count > 1;
  const nextTrip = trips[(activeIndex + 1) % count];
  const previousTrip = trips[(activeIndex - 1 + count) % count];

  // 새 카드가 앞자리에 그려진 뒤에 끌린 위치를 되돌려야 깜빡임이 없다
  useLayoutEffect(() => {
    dragX.setValue(0);
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    Animated.timing(backdropEntry, {
      toValue: 1,
      duration: BACKDROP_ENTRY_DURATION,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [activeIndex, backdropEntry, dragX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // 세로 스크롤은 그대로 두고, 가로로 확실히 움직일 때만 가져온다
        onMoveShouldSetPanResponder: (_event, gesture) =>
          hasStack &&
          Math.abs(gesture.dx) > 8 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: Animated.event([null, { dx: dragX }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_event, gesture) => {
          const shouldAdvance =
            Math.abs(gesture.dx) > SWIPE_DISTANCE ||
            Math.abs(gesture.vx) > SWIPE_VELOCITY;
          if (!shouldAdvance) {
            Animated.spring(dragX, {
              toValue: 0,
              tension: 90,
              friction: 12,
              useNativeDriver: true,
            }).start();
            return;
          }
          const direction = gesture.dx > 0 ? 1 : -1;
          const nextIndex =
            direction > 0
              ? (activeIndex - 1 + count) % count
              : (activeIndex + 1) % count;
          Animated.timing(dragX, {
            toValue: direction * (screenWidth + CARD_HEIGHT),
            duration: SWIPE_OUT_DURATION,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (!finished) return;
            // 새 앞 카드가 렌더링되기 전 뒤 레이어를 숨겨 둔다.
            // activeIndex 변경 effect에서 자연스럽게 다시 등장한다.
            backdropEntry.setValue(0);
            onChangeIndex(nextIndex);
          });
        },
        onPanResponderTerminate: () => {
          Animated.spring(dragX, {
            toValue: 0,
            tension: 90,
            friction: 12,
            useNativeDriver: true,
          }).start();
        },
      }),
    [
      activeIndex,
      backdropEntry,
      count,
      dragX,
      hasStack,
      onChangeIndex,
      screenWidth,
    ],
  );

  if (!trip) return null;
  const frontTrip = trip;

  function handlePressFrontCard() {
    onPressTrip(frontTrip);
  }

  const frontStyle = {
    transform: [
      { translateX: dragX },
      {
        rotate: dragX.interpolate({
          inputRange: [-screenWidth, 0, screenWidth],
          outputRange: ['-8deg', '0deg', '8deg'],
          extrapolate: 'clamp',
        }),
      },
    ],
  };
  // 앞 카드를 끌수록 뒤 레이어가 똑바로 서면서 앞자리로 올라온다
  const backdropStyle = {
    transform: [
      {
        translateX: dragX.interpolate({
          inputRange: [-FULL_PROGRESS_DISTANCE, 0, FULL_PROGRESS_DISTANCE],
          outputRange: [0, BACKDROP_OFFSET_X, 0],
          extrapolate: 'clamp',
        }),
      },
      {
        rotate: dragX.interpolate({
          inputRange: [-FULL_PROGRESS_DISTANCE, 0, FULL_PROGRESS_DISTANCE],
          outputRange: ['0deg', BACKDROP_ROTATION, '0deg'],
          extrapolate: 'clamp',
        }),
      },
    ],
  };
  // 빈 뒤 카드가 앞으로 올라오는 동안 실제 다음 카드 내용을 겹쳐 보여준다.
  // 앞 카드가 화면 밖으로 나갈 때 상태가 바뀌어도 같은 위치·모양을 유지해 끊기지 않는다.
  const nextCardOpacity = dragX.interpolate({
    inputRange: [-FULL_PROGRESS_DISTANCE, -96, -48, -12, 0],
    outputRange: [1, 0.72, 0.34, 0.04, 0],
    extrapolate: 'clamp',
  });
  const previousCardOpacity = dragX.interpolate({
    inputRange: [0, 12, 48, 96, FULL_PROGRESS_DISTANCE],
    outputRange: [0, 0.04, 0.34, 0.72, 1],
    extrapolate: 'clamp',
  });
  const backdropOpacity = dragX.interpolate({
    inputRange: [-FULL_PROGRESS_DISTANCE, 0, FULL_PROGRESS_DISTANCE],
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });
  const enteredBackdropOpacity = Animated.multiply(
    backdropOpacity,
    backdropEntry,
  );
  const backdropEntryOffsetY = backdropEntry.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  return (
    // 기울어진 뒤 레이어가 위아래로 삐져나오는 만큼 여백을 둔다
    <View className="overflow-visible py-[14px]" {...panResponder.panHandlers}>
      <View style={styles.deck}>
        {hasStack ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.backdrop,
              backdropStyle,
              {
                opacity: enteredBackdropOpacity,
                transform: [
                  ...backdropStyle.transform,
                  { translateY: backdropEntryOffsetY },
                ],
              },
            ]}
          />
        ) : null}
        {hasStack && nextTrip ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.preview,
              backdropStyle,
              { opacity: nextCardOpacity },
            ]}
          >
            <TripFeaturedCard trip={nextTrip} />
          </Animated.View>
        ) : null}
        {hasStack && previousTrip ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.preview,
              backdropStyle,
              { opacity: previousCardOpacity },
            ]}
          >
            <TripFeaturedCard trip={previousTrip} />
          </Animated.View>
        ) : null}
        <Animated.View style={[styles.front, frontStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={trip.name}
            onPress={handlePressFrontCard}
          >
            <TripFeaturedCard trip={trip} />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  deck: {
    height: CARD_HEIGHT,
    overflow: 'visible',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT,
    borderRadius: RADIUS[24],
    backgroundColor: COLORS['sky-60'],
    boxShadow: SHADOW['inner-glow'],
    zIndex: 1,
  },
  front: {
    zIndex: 3,
  },
  preview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT,
    zIndex: 2,
  },
});
