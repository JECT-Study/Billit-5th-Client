import { useState } from 'react';
import { TextInput, View } from 'react-native';

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
  errorMessage?: string;
  // 문구 없이 테두리만 에러 색으로 (예: 비어 있는 필수 입력)
  hasError?: boolean;
  autoFocus?: boolean;
};

// Figma: Field/Text (3037:66827) = 라벨 + Input / State=input, Type=default (2260:17258) + 안내·에러 문구
export function TextField({
  label,
  value,
  placeholder,
  maxLength,
  onChangeText,
  hint,
  errorMessage,
  hasError = false,
  autoFocus = false,
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
        <Text className="text-secondary text-label-1 font-medium">{label}</Text>
        <View
          className="rounded-12 px-18 h-48 flex-row items-center border"
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
            placeholderTextColor={COLORS['gray-6']}
            maxLength={maxLength}
            autoFocus={autoFocus}
            autoCorrect={false}
            underlineColorAndroid="transparent"
            selectionColor={COLORS['sky-60']}
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
          <Text className="text-secondary text-caption-1 ml-8">
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
        <Text className="text-muted text-caption-2 font-medium">{hint}</Text>
      ) : null}
    </View>
  );
}
