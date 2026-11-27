import { Pressable, View } from 'react-native';

import type { TripListItem as TripListItemData } from '@/features/trip/list/tripListSchema';
import {
  formatTripDateRange,
  formatTripSpentAmount,
  getTripElapsedRatio,
  TRIP_STATUS_LABELS,
  type TripDisplayStatus,
} from '@/features/trip/list/tripListDisplay';
import {
  SelectionChip,
  type SelectionChipTone,
} from '@/shared/ui/SelectionChip';
import { Text } from '@/shared/ui/Text';

type TripListItemProps = {
  trip: TripListItemData;
  today: string;
  onPress: (tripId: string) => void;
};

const CHIP_TONES: Record<TripDisplayStatus, SelectionChipTone> = {
  ONGOING: 'solid',
  INVITING: 'light',
  UPCOMING: 'subtle',
  ENDED: 'muted',
};

// 여행방 목록 행
export function TripListItem({ trip, today, onPress }: TripListItemProps) {
  const status: TripDisplayStatus = trip.scheduleStatus;
  const isOngoing = status === 'ONGOING';
  const progressPercent = Math.round(getTripElapsedRatio(trip, today) * 100);

  function handlePress() {
    onPress(trip.tripId);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={trip.name}
      onPress={handlePress}
      className="gap-4 px-10 py-12"
    >
      <View className="gap-[18px]">
        <View className="flex-row items-start justify-between">
          <View className="mr-12 flex-1 gap-4">
            <Text
              numberOfLines={1}
              className="text-label-1 text-strong font-semibold"
            >
              {trip.name}
            </Text>
            <Text numberOfLines={1} className="text-caption-2 text-black">
              {formatTripDateRange(trip.startDate, trip.endDate)}
            </Text>
          </View>
          <SelectionChip
            label={TRIP_STATUS_LABELS[status]}
            tone={CHIP_TONES[status]}
          />
        </View>
        <View className="bg-gray-2 rounded-r-6 h-[4px] w-full">
          {isOngoing ? (
            <View
              className="bg-sky-60 rounded-r-6 h-[4px]"
              style={{ width: `${progressPercent}%` }}
            />
          ) : null}
        </View>
      </View>
      {isOngoing ? (
        <View className="items-end">
          <Text className="text-caption-2 text-gray-6 font-semibold">
            {formatTripSpentAmount(trip.myShareAmountKrw)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
