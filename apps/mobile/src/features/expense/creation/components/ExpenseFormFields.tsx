import type { ReactNode } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { CaretDownSmIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';
import {
  formatMoneyInput,
  unformatMoneyInput,
} from '@/features/expense/creation/moneyInput';

export function ExpenseInput({
  label,
  placeholder,
  value,
  onChangeText,
  numeric,
  suffix,
  prefix,
  maxLength,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  numeric?: boolean;
  suffix?: ReactNode;
  prefix?: string;
  maxLength?: number;
}) {
  function handleChangeText(text: string) {
    onChangeText(numeric ? unformatMoneyInput(text) : text);
  }
  return (
    <View className="gap-10">
      <View className="flex-row items-center justify-between">
        <Text className="text-label-1 text-secondary font-medium">{label}</Text>
        {suffix}
      </View>
      <View className="rounded-12 border-gray-2 px-18 h-48 flex-row items-center border bg-white">
        {prefix ? (
          <Text className="text-body-2 text-strong mr-6 font-medium">
            {prefix}
          </Text>
        ) : null}
        <TextInput
          accessibilityLabel={label}
          value={numeric ? formatMoneyInput(value) : value}
          onChangeText={handleChangeText}
          keyboardType={numeric ? 'decimal-pad' : 'default'}
          maxLength={maxLength}
          placeholder={placeholder}
          placeholderTextColor={COLORS['gray-5']}
          className="text-strong h-48 flex-1 p-0"
        />
        {maxLength !== undefined ? (
          <Text className="text-caption-2 text-secondary ml-8 font-semibold">
            {value.length}/{maxLength}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function ExpenseSelectionRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) {
  function handlePress() {
    onPress?.();
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${value}`}
      disabled={!onPress}
      onPress={handlePress}
      className="h-30 flex-row items-center justify-between"
    >
      <Text className="text-label-1 text-secondary font-medium">{label}</Text>
      <View className="flex-row items-center gap-8">
        <Text className="text-label-1 text-strong font-medium">{value}</Text>
        <CaretDownSmIcon />
      </View>
    </Pressable>
  );
}
