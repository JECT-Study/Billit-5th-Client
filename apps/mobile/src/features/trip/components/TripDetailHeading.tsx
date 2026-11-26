import { View } from 'react-native';

import type { TripDetail } from '@/features/trip/tripDetailSchema';
import { formatTripDateRange } from '@/features/trip/tripListDisplay';
import { Text } from '@/shared/ui/Text';

type TripDetailHeadingProps = {
  trip: Pick<TripDetail, 'name' | 'startDate' | 'endDate'>;
};

export function TripDetailHeading({ trip }: TripDetailHeadingProps) {
  return (
    <View>
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        className="text-brand text-heading-1 font-semibold"
      >
        {trip.name}
      </Text>
      <Text className="text-caption-1 mt-[2px] font-semibold text-black">
        {formatTripDateRange(trip.startDate, trip.endDate)}
      </Text>
    </View>
  );
}
