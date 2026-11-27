import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientBackground } from '@/shared/ui/GradientBackground';
import { COLORS, SHADOW } from '@/theme/theme.generated';

const HEIGHT_BELOW_STATUS_BAR = 160;
const GRADIENT_END_OPACITY = 0.1;

export function TripDetailBackground() {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0 top-0"
      style={{
        height: insets.top + HEIGHT_BELOW_STATUS_BAR,
        boxShadow: SHADOW['inner-glow'],
      }}
    >
      <GradientBackground
        startColor={COLORS['sky-30']}
        endColor={COLORS['sky-30']}
        endOpacity={GRADIENT_END_OPACITY}
      />
    </View>
  );
}
