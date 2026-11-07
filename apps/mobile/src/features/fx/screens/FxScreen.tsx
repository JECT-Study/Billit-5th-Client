import { SafeAreaView } from 'react-native-safe-area-context';

import { SCREEN_BACKGROUND_COLOR } from '@/shared/ui/colors';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';

export function FxScreen() {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: SCREEN_BACKGROUND_COLOR }}
    >
      <ScreenHeader title="환율 관리" />
    </SafeAreaView>
  );
}
