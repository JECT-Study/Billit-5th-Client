import { View } from 'react-native';

import CardUnionSvg from '@/assets/images/trip/card-union.svg';
import CoinBagSvg from '@/assets/images/trip/coin-bag.svg';
import type { TripListItem } from '@/features/trip/list/tripListSchema';
import {
  formatTripDateRange,
  formatTripSpentAmount,
} from '@/features/trip/list/tripListDisplay';
import { Text } from '@/shared/ui/Text';
import { SHADOW } from '@/theme/theme.generated';

type TripFeaturedCardProps = {
  trip: TripListItem;
};

// Figma: 여행 목록 상단 진행중 여행 카드 (3227:83947)
// 뒤에 겹치는 카드 레이어와 넘기는 동작은 TripCardStack이 맡는다.
export function TripFeaturedCard({ trip }: TripFeaturedCardProps) {
  return (
    <View
      className="rounded-24 h-[172px] w-full overflow-hidden bg-sky-50"
      style={{ boxShadow: SHADOW['inner-glow'] }}
    >
      {/* 오른쪽 장식: 110 박스를 45° 돌리고, 190 SVG를 박스 기준으로 맞춘다 */}
      <View
        pointerEvents="none"
        className="absolute right-[14px] top-[50px] h-[110px] w-[110px]"
        style={{ transform: [{ rotate: '45deg' }] }}
      >
        <View className="absolute left-[-40px] top-[-50px]">
          <CardUnionSvg width={190} height={190} />
        </View>
      </View>

      <View className="absolute left-[22px] top-[18px] gap-8">
        <View className="w-[283px] gap-4">
          <Text
            numberOfLines={1}
            className="text-headline-1 font-semibold text-white"
          >
            {trip.name}
          </Text>
          <Text className="text-caption-1 text-gray-2 font-semibold">
            {formatTripDateRange(trip.startDate, trip.endDate)}
          </Text>
        </View>
        <View className="bg-gray-1 rounded-r-6 h-[4px] w-[46px]" />
      </View>

      <View className="absolute left-[22px] top-[128px] flex-row items-center gap-4">
        <CoinBagSvg width={20} height={20} />
        <Text className="text-caption-1 text-black">
          {formatTripSpentAmount(trip.myShareAmountKrw)}
        </Text>
      </View>
    </View>
  );
}
