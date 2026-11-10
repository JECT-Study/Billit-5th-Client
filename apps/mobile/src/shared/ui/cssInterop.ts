import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Image, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      color: 'tintColor',
    },
  },
});
