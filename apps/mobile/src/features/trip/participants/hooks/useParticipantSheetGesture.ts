import { useMemo, useRef, useState, type RefObject } from 'react';
import { Animated, Dimensions, PanResponder, Platform } from 'react-native';

const SHEET_DISMISS_DISTANCE = 100;
const SHEET_DISMISS_VELOCITY = 0.8;

export function useParticipantSheetGesture(
  isBusy: boolean,
  isOpeningSettings: boolean,
  onClose: () => void,
  scrollOffset: RefObject<number>,
) {
  const sheetHeight = useRef(0);
  const [sheetTranslateY] = useState(
    () =>
      new Animated.Value(
        Platform.OS === 'android' ? Dimensions.get('window').height : 0,
      ),
  );
  const sheetPanResponder = useMemo(
    () =>
      // 스크롤 위치와 시트 높이는 제스처 이벤트가 발생했을 때만 읽는다.
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          !isBusy &&
          !isOpeningSettings &&
          scrollOffset.current <= 0 &&
          gesture.dy > 8 &&
          gesture.dy > Math.abs(gesture.dx) * 1.5,
        onMoveShouldSetPanResponderCapture: (_event, gesture) =>
          !isBusy &&
          !isOpeningSettings &&
          scrollOffset.current <= 0 &&
          gesture.dy > 8 &&
          gesture.dy > Math.abs(gesture.dx) * 1.5,
        onPanResponderMove: (_event, gesture) => {
          sheetTranslateY.setValue(Math.max(0, gesture.dy));
        },
        onPanResponderRelease: (_event, gesture) => {
          if (
            gesture.dy > SHEET_DISMISS_DISTANCE ||
            (gesture.dy > 25 && gesture.vy > SHEET_DISMISS_VELOCITY)
          ) {
            Animated.timing(sheetTranslateY, {
              toValue: sheetHeight.current || 1000,
              duration: 180,
              useNativeDriver: true,
            }).start(({ finished }) => {
              if (finished) onClose();
            });
            return;
          }
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [isBusy, isOpeningSettings, onClose, scrollOffset, sheetTranslateY],
  );

  function handleSheetShown() {
    if (Platform.OS !== 'android') return;
    Animated.timing(sheetTranslateY, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }

  function animateClose() {
    Animated.timing(sheetTranslateY, {
      toValue: sheetHeight.current || Dimensions.get('window').height,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  }
  return {
    sheetHeight,
    sheetTranslateY,
    sheetPanResponder,
    handleSheetShown,
    animateClose,
  };
}
