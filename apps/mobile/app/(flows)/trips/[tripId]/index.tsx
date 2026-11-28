import { useLocalSearchParams } from 'expo-router';

import { TripDetailScreen } from '@/features/trip';

export default function TripDetailRoute() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  return <TripDetailScreen tripId={tripId} />;
}
