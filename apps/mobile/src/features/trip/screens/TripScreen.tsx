import { SafeAreaView } from 'react-native-safe-area-context';

import { SCREEN_BACKGROUND_COLOR } from '@/shared/ui/colors';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';

export function TripScreen() {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: SCREEN_BACKGROUND_COLOR }}
    >
      <ScreenHeader title="여행방" />
    </SafeAreaView>
  );
}
