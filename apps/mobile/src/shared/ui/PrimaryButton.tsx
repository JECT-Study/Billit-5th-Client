import { Pressable, Text } from 'react-native';

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
      className="bg-primary h-14 items-center justify-center rounded-xl"
    >
      <Text className="text-canvas text-base font-semibold">{label}</Text>
    </Pressable>
  );
}
