import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TripCreatedDecoration } from '@/features/trip/creation/components/TripCreatedDecoration';
import { useTripInvitationQuery } from '@/features/trip/invitation/hooks/useTripInvitationQuery';
import {
  canShareInvitation,
  formatInvitationShareMessage,
} from '@/features/trip/invitation/tripInvitationShare';
import { parseApiError } from '@/lib/apiError';
import { Button } from '@/shared/ui/Button';
import { GradientText } from '@/shared/ui/GradientText';
import { NavigationHeader } from '@/shared/ui/NavigationHeader';
import { Text } from '@/shared/ui/Text';
import { Toast } from '@/shared/ui/Toast';
import { COLORS } from '@/theme/theme.generated';

const INVITATION_LOAD_ERROR_MESSAGE =
  '초대 정보를 불러오지 못했어요. 다시 시도해주세요.';
const SHARE_ERROR_MESSAGE = '공유하지 못했어요. 다시 시도해주세요.';

export function TripCreateCompleteScreen() {
  const { tripId, name } = useLocalSearchParams<{
    tripId?: string;
    name?: string;
  }>();
  const invitationQuery = useTripInvitationQuery(tripId);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dismissedLoadError, setDismissedLoadError] = useState<unknown>(null);

  const invitation = invitationQuery.data;
  const loadError = invitationQuery.error;
  const isShareVisible = canShareInvitation(loadError);

  const loadErrorMessage =
    loadError && isShareVisible && loadError !== dismissedLoadError
      ? (parseApiError(loadError)?.message ?? INVITATION_LOAD_ERROR_MESSAGE)
      : null;
  const visibleToastMessage = toastMessage ?? loadErrorMessage;
  const isShareDisabled =
    invitationQuery.isFetching || (!invitation && !loadError);

  function handleGoToTrips() {
    router.replace('/trips');
  }

  function handleGoToTrip() {
    // TODO: 여행방 상세 화면이 생기면 해당 여행방으로 이동
    router.replace('/trips');
  }

  async function handleShareInvitation() {
    let current = invitation;
    if (!current) {
      const result = await invitationQuery.refetch();
      current = result.data;
    }
    if (!current) return;

    try {
      await Share.share({ message: formatInvitationShareMessage(current) });
    } catch {
      setToastMessage(SHARE_ERROR_MESSAGE);
    }
  }

  function handleDismissToast() {
    if (toastMessage) {
      setToastMessage(null);
      return;
    }
    setDismissedLoadError(loadError);
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      className="bg-surface-default flex-1"
    >
      <TripCreatedDecoration />
      <View className="px-24">
        <NavigationHeader
          title="여행방 생성 완료"
          onPressBack={handleGoToTrips}
        />
      </View>
      <View className="px-24 pt-32">
        <GradientText
          text={`${name ? `${name} ` : ''}여행방이\n생성되었어요.`}
          size="heading-1"
          family="suit-semibold"
          className="text-heading-1 font-semibold"
          startColor={COLORS['gray-8']}
          endColor={COLORS['teal-gradient-end']}
        />
      </View>
      {/* 팡파레 애니메이션 자리 */}
      <View className="flex-1" />
      <View className="px-24 pb-8 pt-8">
        <Text className="text-label-1 text-brand-accent mb-28 text-center font-semibold">
          {'이제 URL로 동행자를 초대하고\n지출을 기록해볼까요?'}
        </Text>
        <View className="flex-row gap-12">
          {isShareVisible ? (
            <Button
              label="초대 URL 공유하기"
              variant="secondary"
              size="compact"
              onPress={handleShareInvitation}
              isDisabled={isShareDisabled}
              className="flex-1"
            />
          ) : null}
          <Button
            label="여행방으로 이동하기"
            size="compact"
            onPress={handleGoToTrip}
            className="flex-1"
          />
        </View>
      </View>

      {visibleToastMessage ? (
        <Toast message={visibleToastMessage} onDismiss={handleDismissToast} />
      ) : null}
    </SafeAreaView>
  );
}
