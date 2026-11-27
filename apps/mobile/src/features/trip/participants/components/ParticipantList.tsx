import { Pressable, ScrollView, View } from 'react-native';

import type { TripDetail, Participant } from '@/features/trip/tripDetailSchema';
import { CrownFillIcon, EditIcon } from '@/shared/ui/icons';
import { SelectionChip } from '@/shared/ui/SelectionChip';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

type Props = {
  trip: TripDetail;
  emptyCount: number;
  canManage: boolean;
  onAddGuest: () => void;
  onEditParticipant: (participant: Participant) => void;
  onScrollOffsetChange: (offset: number) => void;
};

export function ParticipantList({
  trip,
  emptyCount,
  canManage,
  onAddGuest,
  onEditParticipant,
  onScrollOffsetChange,
}: Props) {
  const active = trip.participants.filter(
    (p) => p.participantStatus === 'MEMBER' || p.participantStatus === 'GUEST',
  );
  const previous = trip.participants.filter(
    (p) =>
      p.participantStatus === 'LEFT' || p.participantStatus === 'WITHDRAWN',
  );
  function handleAddGuest() {
    onAddGuest();
  }
  // Figma: Invite / Participant (2260:16939) 행. 높이 48, 아래 테두리
  return (
    <ScrollView
      className="mt-30"
      contentContainerClassName="gap-30 pb-24"
      showsVerticalScrollIndicator={false}
      onScroll={(event) => {
        onScrollOffsetChange(event.nativeEvent.contentOffset.y);
      }}
      scrollEventThrottle={16}
    >
      {emptyCount > 0 ? (
        <View className="gap-8">
          <Text className="text-strong text-body-2 font-semibold">참여전</Text>
          {Array.from({ length: emptyCount }, (_, i) => (
            <View
              key={i}
              className="border-gray-2 px-18 h-48 flex-row items-center justify-between border-b"
            >
              <Text className="text-body-2 text-gray-7 font-medium">
                참여자 {i + 1}
              </Text>
              {canManage ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="직접 추가하기"
                  onPress={handleAddGuest}
                >
                  <SelectionChip label="직접 추가하기" tone="stroke" />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
      <View className="z-20 gap-8">
        <Text className="text-sky-60 text-body-2 font-semibold">참여완료</Text>
        <View className="bg-sky-10 rounded-8">
          {active.map((p) => (
            <View
              key={p.tripMemberId}
              className="border-gray-2 px-18 h-48 flex-row items-center justify-between border-b"
            >
              <View className="flex-row items-center gap-2">
                {/* Figma: 방장 닉네임만 gray-6 */}
                <Text
                  className={`text-body-2 font-medium ${p.role === 'ADMIN' ? 'text-gray-6' : 'text-gray-7'}`}
                >
                  {p.tripNickname}
                </Text>
                {p.role === 'ADMIN' ? (
                  <CrownFillIcon size={18} color={COLORS['sky-70']} />
                ) : null}
                {canManage && p.participantStatus === 'GUEST' ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${p.tripNickname} 수정`}
                    onPress={() => onEditParticipant(p)}
                  >
                    <EditIcon size={20} color={COLORS['gray-6']} />
                  </Pressable>
                ) : null}
              </View>
              {p.participantStatus === 'GUEST' ? (
                <SelectionChip label="비로그인" tone="white" />
              ) : null}
            </View>
          ))}
        </View>
      </View>
      {previous.length ? (
        <View className="gap-8">
          <Text className="text-muted text-body-2">이전 참여자</Text>
          {previous.map((p) => (
            <Text key={p.tripMemberId} className="text-muted px-18">
              {p.tripNickname} (
              {p.participantStatus === 'LEFT' ? '나감' : '탈퇴'})
            </Text>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
