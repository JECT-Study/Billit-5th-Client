import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/ui/Button';
import { NavigationHeader } from '@/shared/ui/NavigationHeader';
import { Text } from '@/shared/ui/Text';

export function TripCreateCompleteScreen() {
  const { name } = useLocalSearchParams<{ name?: string }>();

  function handleGoToTrips() {
    router.replace('/trips');
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      className="bg-surface-default flex-1"
    >
      <View className="px-24">
        <NavigationHeader
          title="여행방 생성 완료"
          onPressBack={handleGoToTrips}
        />
      </View>
      <View className="flex-1 px-24 pt-48">
        <Text className="text-headline-1 text-primary font-semibold">
          {name ? `${name} 여행방이` : '여행방이'}
          {'\n생성되었어요.'}
        </Text>
      </View>
      <View className="px-24 pb-8 pt-8">
        <Button label="여행 관리로 돌아가기" onPress={handleGoToTrips} />
      </View>
    </SafeAreaView>
  );
}
