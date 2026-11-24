import { useLocalSearchParams } from 'expo-router';

import { TripSettingsScreen } from '@/features/trip';

export default function TripSettingsRoute() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  return <TripSettingsScreen tripId={tripId} />;
}
