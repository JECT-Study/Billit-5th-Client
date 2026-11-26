import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';

import ParticipantSpinner from '@/assets/images/trip/participant-spinner.svg';
import { Text } from '@/shared/ui/Text';

type TripInvitationStatusProps = {
  memberCapacity: number;
  isFull: boolean;
};

export function TripInvitationStatus({
  memberCapacity,
  isFull,
}: TripInvitationStatusProps) {
  const [rotation] = useState(() => new Animated.Value(0));
  const [isReducedMotionEnabled, setReducedMotionEnabled] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let hasChanged = false;
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        hasChanged = true;
        setReducedMotionEnabled(enabled);
      },
    );
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted && !hasChanged) setReducedMotionEnabled(enabled);
    });
    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    rotation.setValue(0);
    if (isFull || isReducedMotionEnabled) return;
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [isFull, isReducedMotionEnabled, rotation]);

  return (
    <View className="bg-sky-20 rounded-100 h-28 flex-row items-center justify-center gap-10 px-16">
      <Text className="text-sky-70 text-label-1 font-semibold">
        {isFull ? '모두 참여완료' : `${memberCapacity}명 참여중`}
      </Text>
      {!isFull ? (
        <Animated.View
          accessible={false}
          style={{
            transform: [
              {
                rotate: rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          }}
        >
          <ParticipantSpinner />
        </Animated.View>
      ) : null}
    </View>
  );
}
