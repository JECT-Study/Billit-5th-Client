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
              <Text className="text-secondary text-body-2">참여자 {i + 1}</Text>
              {canManage ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={handleAddGuest}
                  className="border-sky-60 rounded-6 border px-10 py-6"
                >
                  <Text className="text-sky-60 text-caption-2 font-semibold">
                    직접 추가하기
                  </Text>
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
              className="px-18 h-48 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-4">
                <Text className="text-strong text-body-2">
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
                    <EditIcon size={20} />
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
