import { Text, View } from 'react-native';

import { GRAY_008 } from './colors';

type ScreenHeaderProps = {
  title: string;
};

export function ScreenHeader({ title }: ScreenHeaderProps) {
  return (
    <View
      style={{
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        accessibilityRole="header"
        style={{
          color: GRAY_008,
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
    </View>
  );
}
