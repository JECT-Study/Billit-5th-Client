import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavigationHeader } from '@/shared/ui/NavigationHeader';

// TODO: 여행방 생성 단계 구현
export function TripCreateScreen() {
  function handlePressBack() {
    router.back();
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="bg-surface-default flex-1"
    >
      <NavigationHeader title="여행방 만들기" onPressBack={handlePressBack} />
    </SafeAreaView>
  );
}
