import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TripEmptyState } from '@/features/trip/components/TripEmptyState';
import { TripHomeHeader } from '@/features/trip/components/TripHomeHeader';
import { GradientBackground } from '@/shared/ui/GradientBackground';

export function TripScreen() {
  function handlePressNotification() {
    // TODO: 알림 화면이 생기면 이동
  }

  function handlePressCreateTrip() {
    router.push('/trips/new');
  }

  function handlePressJoinWithInviteCode() {
    // TODO: 초대코드 참여 흐름 연결
  }

  // TODO: 여행방 목록 API 연결 후 trips.length === 0 ? <TripEmptyState /> : <TripList /> 로 분기
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1">
      <GradientBackground />
      <TripHomeHeader onPressNotification={handlePressNotification} />
      <TripEmptyState
        onPressCreateTrip={handlePressCreateTrip}
        onPressJoinWithInviteCode={handlePressJoinWithInviteCode}
      />
    </SafeAreaView>
  );
}
