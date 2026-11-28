import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import {
  TRIP_CURRENCIES,
  type TripCurrency,
} from '@/features/trip/shared/tripCreationForm';
import { CurrencyFlag } from '@/shared/ui/CurrencyFlag';
import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/Text';

type TripCurrencySheetProps = {
  value: TripCurrency;
  onConfirm: (currency: TripCurrency) => void;
  onClose: () => void;
};

export function TripCurrencySheet({
  value,
  onConfirm,
  onClose,
}: TripCurrencySheetProps) {
  const [pendingCurrency, setPendingCurrency] = useState(value);

  function handleConfirm() {
    onConfirm(pendingCurrency);
  }

  function handleClose() {
    onClose();
  }

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="통화 선택 닫기"
          onPress={handleClose}
          className="absolute inset-0 bg-black/40"
        />
        <View className="rounded-t-30 bg-surface-default px-24 pb-32 pt-24">
          <Text className="text-strong text-headline-1 mb-24 font-semibold">
            지원 통화
          </Text>
          <View className="mb-24 flex-row flex-wrap gap-10">
            {TRIP_CURRENCIES.map((currency) => {
              const isSelected = currency.code === pendingCurrency;

              function handlePress() {
                setPendingCurrency(currency.code);
              }

              return (
                <Pressable
                  key={currency.code}
                  accessibilityRole="button"
                  accessibilityLabel={currency.label}
                  accessibilityState={{ selected: isSelected }}
                  onPress={handlePress}
                  className={`rounded-8 h-[46px] basis-[48%] flex-row items-center justify-center gap-10 border ${isSelected ? 'bg-surface-selected border-selected' : 'border-gray-2'}`}
                >
                  <CurrencyFlag currency={currency.code} />
                  <Text
                    numberOfLines={1}
                    className={`text-body-2 shrink font-medium ${isSelected ? 'text-sky-100' : 'text-secondary'}`}
                  >
                    {currency.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Button label="선택 완료" onPress={handleConfirm} />
        </View>
      </View>
    </Modal>
  );
}
