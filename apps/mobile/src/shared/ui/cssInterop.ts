import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg } from 'react-native-svg';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Svg, { className: 'style' });
cssInterop(Image, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      color: 'tintColor',
    },
  },
});
