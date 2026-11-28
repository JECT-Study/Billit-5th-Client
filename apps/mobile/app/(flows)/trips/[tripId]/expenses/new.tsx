import { useLocalSearchParams } from 'expo-router';

import { ExpenseCreateScreen } from '@/features/expense';

export default function ExpenseCreateRoute() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  return <ExpenseCreateScreen tripId={tripId} />;
}
