import { useLocalSearchParams, useNavigation } from 'expo-router';

import { TripDetailScreen } from '@/features/trip';

export default function TripDetailRoute() {
  const { tripId, expenseAdded } = useLocalSearchParams<{
    tripId?: string;
    expenseAdded?: string;
  }>();
  const navigation = useNavigation<{
    setParams: (params: { expenseAdded?: string }) => void;
  }>();
  function handleDismissToast() {
    navigation.setParams({ expenseAdded: undefined });
  }
  return (
    <TripDetailScreen
      tripId={tripId}
      isExpenseAddedToastVisible={expenseAdded === '1'}
      onDismissExpenseAddedToast={handleDismissToast}
    />
  );
}
