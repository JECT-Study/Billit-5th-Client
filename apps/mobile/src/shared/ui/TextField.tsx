import { useState } from 'react';
import { TextInput, View } from 'react-native';

import HintCheckSvg from '@/assets/images/form/hint-check.svg';
import { Text } from '@/shared/ui/Text';
import { COLORS, FONT_SIZE } from '@/theme/theme.generated';

type TextFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  maxLength: number;
  onChangeText: (value: string) => void;
  // 입력창 아래에 보이는 안내. errorMessage가 있으면 그 자리를 에러 문구가 대신한다.
  hint?: string;
  isHintSatisfied?: boolean;
  errorMessage?: string;
  // 문구 없이 테두리만 에러 색으로 (예: 비어 있는 필수 입력)
  hasError?: boolean;
  autoFocus?: boolean;
  showLabel?: boolean;
};

export function TextField({
  label,
  value,
  placeholder,
  maxLength,
  onChangeText,
  hint,
  isHintSatisfied = false,
  errorMessage,
  hasError = false,
  autoFocus = false,
  showLabel = true,
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isErrorShown = hasError || errorMessage !== undefined;

  function handleChangeText(text: string) {
    onChangeText(text);
  }

  function handleFocus() {
    setIsFocused(true);
  }

  function handleBlur() {
    setIsFocused(false);
  }

  return (
    <View className="gap-12">
      <View className="gap-10">
        {showLabel ? (
          <Text className="text-secondary text-label-1 font-medium">
            {label}
          </Text>
        ) : null}
        <View
          className="rounded-12 px-18 bg-surface-default h-48 flex-row items-center border"
          style={{
            borderColor: isErrorShown
              ? COLORS['red-alert']
              : isFocused
                ? COLORS['sky-30']
                : COLORS['gray-2'],
          }}
        >
          <TextInput
            accessibilityLabel={label}
            value={value}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor={
              isFocused ? COLORS['gray-6'] : COLORS['gray-5']
            }
            maxLength={maxLength}
            autoFocus={autoFocus}
            autoCorrect={false}
            underlineColorAndroid="transparent"
            selectionColor={COLORS['gray-4']}
            cursorColor={COLORS['gray-4']}
            className="text-strong flex-1 font-medium"
            style={{
              fontSize: FONT_SIZE['body-2'][0],
              letterSpacing: FONT_SIZE['body-2'][1].letterSpacing,
              height: 28,
              padding: 0,
              margin: 0,
              includeFontPadding: false,
              textAlignVertical: 'center',
            }}
          />
          <Text className="text-secondary text-caption-2 ml-8 font-semibold">
            {value.length}/{maxLength}
          </Text>
        </View>
      </View>
      {errorMessage ? (
        <Text
          className="text-caption-2 font-semibold"
          style={{ color: COLORS['red-alert-dark'] }}
        >
          {errorMessage}
        </Text>
      ) : hint ? (
        <View className="flex-row items-center gap-4">
          <Text className="text-muted text-caption-2 font-medium">{hint}</Text>
          {isHintSatisfied ? <HintCheckSvg /> : null}
        </View>
      ) : null}
    </View>
  );
}
