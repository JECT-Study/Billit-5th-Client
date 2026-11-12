import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavigationHeader } from '@/shared/ui/NavigationHeader';

export function FxScreen() {
  function handlePressBack() {
    router.back();
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="bg-surface-default flex-1"
    >
      <NavigationHeader title="환율 관리" onPressBack={handlePressBack} />
    </SafeAreaView>
  );
}
