import { View } from 'react-native';

import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/Text';

type TripEmptyStateProps = {
  onPressCreateTrip: () => void;
  onPressJoinWithInviteCode: () => void;
};

export function TripEmptyState({
  onPressCreateTrip,
  onPressJoinWithInviteCode,
}: TripEmptyStateProps) {
  function handlePressCreateTrip() {
    onPressCreateTrip();
  }

  function handlePressJoinWithInviteCode() {
    onPressJoinWithInviteCode();
  }

  return (
    <View className="flex-1 justify-center px-24">
      <Text className="text-strong text-body-1 text-center font-semibold">
        {'아직 진행 중인 여행이 없어요.\n여행을 생성해보세요.'}
      </Text>
      <View className="mt-[73px] gap-10">
        <Button label="첫 여행방 만들기" onPress={handlePressCreateTrip} />
        <Button
          variant="light"
          label="초대코드로 참여하기"
          onPress={handlePressJoinWithInviteCode}
        />
      </View>
    </View>
  );
}
