import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiBaseUrl } from '@/lib/api';

export default function HomeScreen() {

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-2">
          <Text className="text-brand text-3xl font-bold">Billit</Text>
          <Text className="text-base text-neutral-700">API {apiBaseUrl}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
