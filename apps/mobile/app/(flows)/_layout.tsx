// 탭 바 없이 진행하는 작업 흐름. 완료하거나 취소하면 이전 화면으로 돌아간다.
import { Stack } from 'expo-router';

export default function FlowLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
