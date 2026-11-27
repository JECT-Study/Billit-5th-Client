import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import {
  TRIP_COUNTRIES,
  type TripCountryCode,
} from '@/features/trip/shared/tripCreationForm';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

type TripCountrySelectProps = {
  countryCode: TripCountryCode | null;
  customCountryName: string;
  onSelectCountry: (code: TripCountryCode) => void;
  onChangeCustomCountryName: (value: string) => void;
  // 「기타」를 새로 골랐을 때만 바로 입력하게 한다. 이미 저장된 기타 국가를 열 때는 끈다.
  isCustomInputAutoFocused?: boolean;
};

const CUSTOM_COUNTRY_MAX_LENGTH = 10;

export function TripCountrySelect({
  countryCode,
  customCountryName,
  onSelectCountry,
  onChangeCustomCountryName,
  isCustomInputAutoFocused = true,
}: TripCountrySelectProps) {
  const [isCustomFocused, setIsCustomFocused] = useState(false);

  function handleFocusCustom() {
    setIsCustomFocused(true);
  }

  function handleChangeCustomText(value: string) {
    onChangeCustomCountryName(value);
  }

  function handleBlurCustom() {
    setIsCustomFocused(false);
  }

  return (
    <View className="gap-10">
      <Text className="text-secondary text-label-1 font-medium">
        어디로 떠나시나요?
      </Text>
      <View className="flex-row flex-wrap gap-10">
        {TRIP_COUNTRIES.map((country) => {
          const isSelected = country.code === countryCode;
          const isCustomInput = isSelected && country.code === 'ETC';

          function handlePress() {
            onSelectCountry(country.code);
          }

          // 선택한 "기타" 타일은 국가명을 직접 입력받는 입력창으로 바뀐다
          if (isCustomInput) {
            return (
              <View
                key={country.code}
                className="rounded-8 h-[48px] flex-grow basis-[48%] flex-row items-center border px-12"
                style={{
                  borderColor: isCustomFocused
                    ? COLORS['sky-30']
                    : COLORS['gray-2'],
                }}
              >
                <View className="bg-gray-4 mr-10 h-28 w-px" />
                <TextInput
                  accessibilityLabel="여행 국가 직접 입력"
                  value={customCountryName}
                  onChangeText={handleChangeCustomText}
                  onFocus={handleFocusCustom}
                  onBlur={handleBlurCustom}
                  placeholder="여행국가 입력"
                  placeholderTextColor={COLORS['gray-6']}
                  maxLength={CUSTOM_COUNTRY_MAX_LENGTH}
                  autoFocus={isCustomInputAutoFocused}
                  autoCorrect={false}
                  underlineColorAndroid="transparent"
                  selectionColor={COLORS['sky-60']}
                  className="text-strong text-body-2 flex-1 font-medium"
                  style={{ padding: 0, margin: 0, includeFontPadding: false }}
                />
              </View>
            );
          }

          return (
            <Pressable
              key={country.code}
              accessibilityRole="button"
              accessibilityLabel={country.label}
              accessibilityState={{ selected: isSelected }}
              onPress={handlePress}
              className={`rounded-8 h-[48px] flex-grow basis-[48%] items-center justify-center border ${isSelected ? 'bg-surface-selected border-selected' : 'border-gray-2'}`}
            >
              <Text
                className={`text-body-2 font-medium ${isSelected ? 'text-brand' : 'text-secondary'}`}
              >
                {country.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
