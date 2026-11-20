import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { CurrencyFlag } from '@/features/trip/components/TripCurrencyFlag';
import { TripCurrencySheet } from '@/features/trip/components/TripCurrencySheet';
import {
  TRIP_CURRENCIES,
  type TripCurrency,
} from '@/features/trip/tripCreationForm';
import { CaretRightSmIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

type TripCurrencyFieldProps = {
  value: TripCurrency;
  onChange: (currency: TripCurrency) => void;
};

export function TripCurrencyField({ value, onChange }: TripCurrencyFieldProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const currency = TRIP_CURRENCIES.find((item) => item.code === value);

  function handleOpen() {
    setIsSheetOpen(true);
  }

  function handleConfirm(nextCurrency: TripCurrency) {
    onChange(nextCurrency);
    setIsSheetOpen(false);
  }

  function handleClose() {
    setIsSheetOpen(false);
  }

  return (
    <View className="gap-10">
      <View className="flex-row items-center justify-between">
        <Text className="text-secondary text-label-1 font-medium">
          기본 통화
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="다른 통화 선택하기"
          onPress={handleOpen}
          className="flex-row items-center"
        >
          <Text className="text-brand text-label-1 font-semibold">
            다른 통화 선택하기
          </Text>
          <CaretRightSmIcon color={COLORS['sky-90']} />
        </Pressable>
      </View>
      <View className="border-gray-2 rounded-8 px-18 flex-row items-center gap-12 border py-12">
        <View className="flex-row items-center gap-6">
          <CurrencyFlag currency={value} />
          <Text className="text-secondary text-body-2 font-medium">
            {currency?.label.replace(` ${value}`, '')}
          </Text>
        </View>
        <Text className="text-strong text-body-2 font-medium">{value}</Text>
      </View>
      {isSheetOpen ? (
        <TripCurrencySheet
          value={value}
          onConfirm={handleConfirm}
          onClose={handleClose}
        />
      ) : null}
    </View>
  );
}
