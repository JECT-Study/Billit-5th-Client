import { Pressable, View } from 'react-native';

import { TripParticipantMenu } from '@/features/trip/participants/components/TripParticipantMenu';
import type { TripDetail } from '@/features/trip/tripDetailSchema';
import { Button } from '@/shared/ui/Button';
import { MoreIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { Tooltip } from '@/shared/ui/Tooltip';
import { COLORS } from '@/theme/theme.generated';

type Props = {
  trip: TripDetail;
  canManage: boolean;
  emptyCount: number;
  isMenuOpen: boolean;
  isBusy: boolean;
  isMutating: boolean;
  isReadyToOpen: boolean;
  onShare: () => void;
  onShareFromMenu: () => void;
  onSettings: () => void;
  onToggleMenu: () => void;
  onConfirm: () => void;
};

export function ParticipantSheetActions({
  trip,
  canManage,
  emptyCount,
  isMenuOpen,
  isBusy,
  isMutating,
  isReadyToOpen,
  onShare,
  onShareFromMenu,
  onSettings,
  onToggleMenu,
  onConfirm,
}: Props) {
  function handleShare() {
    onShare();
  }
  function handleShareFromMenu() {
    onShareFromMenu();
  }
  function handleSettings() {
    onSettings();
  }
  function handleToggle() {
    onToggleMenu();
  }
  function handleConfirm() {
    onConfirm();
  }
  return (
    <>
      {canManage ? (
        <View className="gap-8">
          {emptyCount > 0 ? (
            <>
              <Text className="text-caption-1 text-center font-semibold text-black">
                모두 참여하면 여행을 오픈할 수 있어요
              </Text>
              <View className="flex-row gap-12">
                <Button
                  label="초대코드 공유"
                  variant="light"
                  onPress={handleShare}
                  isDisabled={isMutating}
                  className="flex-1"
                />
                <Button
                  label="여행방 설정"
                  onPress={handleSettings}
                  isDisabled={isMutating}
                  className="flex-1"
                />
              </View>
            </>
          ) : (
            <>
              {!isMenuOpen ? (
                <View className="max-w-full self-end">
                  <Tooltip
                    label="인원이 가득 찼어요. 추가하려면 여행 설정에 들어가주세요."
                    tailAlignment="right"
                    labelTone="subtle"
                  />
                </View>
              ) : null}
              <View className="items-end">
                {isMenuOpen ? (
                  <View className="absolute bottom-[47px] right-0 z-10">
                    <TripParticipantMenu
                      onShare={handleShareFromMenu}
                      onSettings={handleSettings}
                    />
                  </View>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="여행방 메뉴"
                  accessibilityState={{ expanded: isMenuOpen }}
                  onPress={handleToggle}
                  disabled={isBusy}
                  className="bg-gray-8 rounded-100 p-10"
                >
                  <MoreIcon color={COLORS.white} />
                </Pressable>
              </View>
              <Button
                label="여행방 오픈하기"
                onPress={handleConfirm}
                isDisabled={isBusy || !isReadyToOpen}
              />
            </>
          )}
        </View>
      ) : trip.myRole === 'MEMBER' && trip.status === 'UNCONFIRMED' ? (
        <View className="items-center pb-20 pt-8">
          <Text className="text-caption-1 text-center font-semibold text-black">
            모두 참여하면 여행이 오픈돼요!
          </Text>
        </View>
      ) : null}
    </>
  );
}
