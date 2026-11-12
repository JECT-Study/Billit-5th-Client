import { Pressable } from 'react-native';

import { Text } from '@/shared/ui/Text';

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
      className="bg-action-primary-background h-58 rounded-12 items-center justify-center"
    >
      <Text className="text-action-primary-foreground text-body-1 font-semibold">
        {label}
      </Text>
    </Pressable>
  );
}
