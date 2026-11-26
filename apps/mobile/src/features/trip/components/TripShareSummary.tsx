import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import CoinBagSvg from '@/assets/images/trip/share-summary-coin-bag.svg';
import type { Participant } from '@/features/trip/tripDetailSchema';
import {
  LEFT_PARTICIPANT_LABEL,
  sortTripParticipants,
} from '@/features/trip/tripDetailDisplay';
import { formatKrw } from '@/features/trip/tripListDisplay';
import {
  CaretDownSmIcon,
  CaretUpSmIcon,
  UserFillIcon,
} from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { COLORS, SHADOW } from '@/theme/theme.generated';

// 토큰에 없는 아바타 안쪽 빛(시안 값)
const AVATAR_INNER_GLOW = 'inset 0px 0px 16px 0px #FFFFFF99';

type TripShareSummaryProps = {
  participants: readonly Participant[];
};

export function TripShareSummary({ participants }: TripShareSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sortedParticipants = useMemo(
    () => sortTripParticipants(participants),
    [participants],
  );
  const CaretIcon = isExpanded ? CaretUpSmIcon : CaretDownSmIcon;

  function handlePressToggle() {
    setIsExpanded((current) => !current);
  }

  return (
    <View
      className="border-sky-20 rounded-12 border bg-white px-10 py-12"
      style={{ boxShadow: SHADOW['inner-glow'] }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="누적 정산금"
        accessibilityState={{ expanded: isExpanded }}
        onPress={handlePressToggle}
        className="flex-row items-center justify-between"
      >
        <View className="flex-1 flex-row items-center gap-10">
          <CoinBagSvg width={28} height={28} />
          <View className="flex-1 gap-[2px]">
            <Text className="text-body-1 font-medium text-black">
              누적 정산금
            </Text>
            <Text
              className={`text-caption-2 font-medium ${isExpanded ? 'text-gray-6' : 'text-gray-5'}`}
            >
              참여자들의 개별 정산금을 한 눈에 확인해요
            </Text>
          </View>
        </View>
        <CaretIcon />
      </Pressable>

      {isExpanded ? (
        <View className="mt-10 gap-6 px-4">
          {sortedParticipants.map((participant) => (
            <TripShareSummaryRow
              key={participant.tripMemberId}
              participant={participant}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

type TripShareSummaryRowProps = {
  participant: Participant;
};

function TripShareSummaryRow({ participant }: TripShareSummaryRowProps) {
  const isLeft = participant.participantStatus === 'LEFT';

  return (
    <View className="flex-row items-center justify-between py-6">
      <View className="mr-12 flex-1 flex-row items-center gap-8">
        <View
          className="rounded-100 bg-gray-3 h-24 w-24 items-center justify-center"
          style={{ boxShadow: AVATAR_INNER_GLOW }}
        >
          <UserFillIcon size={12} color={COLORS.white} />
        </View>
        <Text
          numberOfLines={1}
          className="text-label-1 shrink font-semibold text-sky-100"
        >
          {participant.tripNickname}
        </Text>
        {isLeft ? (
          <Text className="text-caption-2 text-gray-5 font-medium">
            {LEFT_PARTICIPANT_LABEL}
          </Text>
        ) : null}
      </View>
      <Text className="text-label-1 font-semibold text-black">
        {formatKrw(participant.shareAmountKrw)}
      </Text>
    </View>
  );
}
