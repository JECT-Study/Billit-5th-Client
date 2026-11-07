import { Pressable, Text, View } from 'react-native';

import { GRAY_008 } from './colors';

type NavigationHeaderProps = {
  title: string;
  onPressBack: () => void;
};

export function NavigationHeader({
  title,
  onPressBack,
}: NavigationHeaderProps) {
  function handlePressBack() {
    onPressBack();
  }

  return (
    <View
      style={{
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        onPress={handlePressBack}
        style={{
          width: 48,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: GRAY_008, fontSize: 28, lineHeight: 32 }}>‹</Text>
      </Pressable>
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        style={{
          flex: 1,
          color: GRAY_008,
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <View style={{ width: 48 }} />
    </View>
  );
}
