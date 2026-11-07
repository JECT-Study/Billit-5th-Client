import { Pressable, Text } from 'react-native';

import { PRIMARY_BUTTON_COLOR, SCREEN_BACKGROUND_COLOR } from './colors';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
};

export function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  function handlePress() {
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      style={{
        height: 52,
        borderRadius: 12,
        backgroundColor: PRIMARY_BUTTON_COLOR,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: SCREEN_BACKGROUND_COLOR,
          fontSize: 16,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
