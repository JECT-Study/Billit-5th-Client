import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Participant } from '@/features/trip/tripDetailSchema';
import { CheckIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

type Props = {
  visible: boolean;
  mode: 'payer' | 'participants';
  participants: Participant[];
  selectedIds: string[];
  getName: (participant: Participant) => string;
  onSelect: (id: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function ExpenseParticipantSheet({
  visible,
  mode,
  participants,
  selectedIds,
  getName,
  onSelect,
  onClose,
  onConfirm,
}: Props) {
  const insets = useSafeAreaInsets();
  const isPayer = mode === 'payer';
  function handleClose() {
    onClose();
  }
  function handleConfirm() {
    onConfirm();
  }
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isPayer ? '결제자 선택 닫기' : '정산 대상자 선택 닫기'
          }
          onPress={handleClose}
          className="absolute inset-0 bg-black/40"
        />
        <View
          className="rounded-t-30 bg-white pt-20"
          style={{ paddingBottom: insets.bottom + 15, maxHeight: '80%' }}
        >
          <View className="h-[46px] flex-row items-center justify-between px-28">
            <Text className="text-headline-1 text-strong font-semibold">
              {isPayer
                ? '결제자를 선택해주세요.'
                : '정산 대상자를 선택해주세요.'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={handleConfirm}
              className="px-12 py-10"
            >
              <Text className="text-body-1 text-sky-60 font-semibold">
                완료
              </Text>
            </Pressable>
          </View>
          <ScrollView
            contentContainerClassName="px-24 pt-12"
            keyboardShouldPersistTaps="handled"
          >
            {participants.map((participant) => {
              const isGuest =
                isPayer && participant.participantStatus === 'GUEST';
              const isSelected = selectedIds.includes(participant.tripMemberId);
              return (
                <Pressable
                  key={participant.tripMemberId}
                  accessibilityRole={isPayer ? 'radio' : 'checkbox'}
                  accessibilityState={{
                    checked: isSelected,
                    ...(isPayer ? { disabled: isGuest } : {}),
                  }}
                  disabled={isGuest}
                  onPress={() => onSelect(participant.tripMemberId)}
                  className="h-48 flex-row items-center justify-between px-6"
                >
                  <Text
                    className={`text-body-2 font-medium ${isSelected ? 'text-sky-60' : 'text-strong'}`}
                  >
                    {getName(participant)}
                  </Text>
                  {isGuest ? (
                    <View className="rounded-6 bg-gray-2 px-10 py-6">
                      <Text className="text-caption-2 text-muted font-medium">
                        비로그인
                      </Text>
                    </View>
                  ) : (
                    <CheckIcon
                      size={16}
                      color={isSelected ? COLORS['sky-60'] : COLORS['gray-4']}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
