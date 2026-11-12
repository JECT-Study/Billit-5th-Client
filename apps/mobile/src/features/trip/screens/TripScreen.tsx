import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/shared/ui/ScreenHeader';

export function TripScreen() {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="bg-surface-default flex-1"
    >
      <ScreenHeader title="여행방" />
    </SafeAreaView>
  );
}
