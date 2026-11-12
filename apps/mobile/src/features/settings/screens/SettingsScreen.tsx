import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { Text } from '@/shared/ui/Text';

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
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="bg-surface-default flex-1"
    >
      <ScreenHeader title="마이" />
      <Text
        accessibilityRole="header"
        className="text-primary text-heading-2 px-24 pb-8 pt-16 font-bold"
      >
        설정
      </Text>
      <View className="bg-sky-10 items-center justify-center py-48">
        <Text className="text-center font-normal">사용자 프로필 View</Text>
      </View>
      <Text
        accessibilityRole="header"
        className="text-primary text-heading-2 px-20 pb-8 pt-16 font-bold"
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
      className="border-default h-58 flex-row items-center justify-between border-b px-24"
    >
      <Text className="text-primary text-body-1 font-normal">{label}</Text>
      <View accessible={false}>
        <Text className="text-icon-inactive text-title-3 font-normal">›</Text>
      </View>
    </Pressable>
  );
}
