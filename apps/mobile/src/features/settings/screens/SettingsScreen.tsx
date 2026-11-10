import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/shared/ui/ScreenHeader';

export function SettingsScreen() {
  function handlePressTripList() {
    router.push('/my/trips');
  }

  function handlePressSettlements() {
    router.navigate('/settlements');
  }

  function handlePressExchangeRate() {
    router.push('/my/fx');
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="bg-canvas flex-1">
      <ScreenHeader title="마이" />
      <Text
        accessibilityRole="header"
        className="text-gray-008 px-6 pb-2 pt-4 text-xl font-bold"
      >
        설정
      </Text>
      <View className="bg-surface items-center justify-center py-12">
        <Text className="text-center font-normal">사용자 프로필 View</Text>
      </View>
      <Text
        accessibilityRole="header"
        className="text-gray-008 px-5 pb-2 pt-4 text-xl font-bold leading-7"
      >
        내 공간
      </Text>
      <SettingsLinkRow
        label="여행 목록 수정 · 나가기"
        onPress={handlePressTripList}
      />
      <SettingsLinkRow label="내 정산 내역" onPress={handlePressSettlements} />
      <SettingsLinkRow
        label="내 환율 관리하기"
        onPress={handlePressExchangeRate}
      />
    </SafeAreaView>
  );
}

type SettingsLinkRowProps = {
  label: string;
  onPress: () => void;
};

function SettingsLinkRow({ label, onPress }: SettingsLinkRowProps) {
  function handlePress() {
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      className="border-line h-14 flex-row items-center justify-between border-b px-6"
    >
      <Text className="text-gray-008 text-base font-normal">{label}</Text>
      <View accessible={false}>
        <Text className="text-gray-004 text-2xl font-normal leading-6">›</Text>
      </View>
    </Pressable>
  );
}
