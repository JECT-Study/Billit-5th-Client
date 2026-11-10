// 모달로 띄우는 화면. 닫으면 이전 화면으로 돌아간다.
import { Stack } from 'expo-router';

export default function ModalLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
