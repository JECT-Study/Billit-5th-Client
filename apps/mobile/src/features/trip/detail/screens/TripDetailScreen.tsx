import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { TripDetailBackground } from '@/features/trip/detail/components/TripDetailBackground';
import {
  TRIP_DETAIL_BOTTOM_BAR_HEIGHT,
  TripDetailBottomBar,
} from '@/features/trip/detail/components/TripDetailBottomBar';
import { TripDetailHeading } from '@/features/trip/detail/components/TripDetailHeading';
import { TripRecordSection } from '@/features/trip/detail/components/TripRecordSection';
import { TripShareSummary } from '@/features/trip/detail/components/TripShareSummary';
import { useTripQuery } from '@/features/trip/hooks/useTripQuery';
import {
  getTripDetailNotice,
  type TripDetailNotice,
} from '@/features/trip/detail/tripDetail';
import type { TripDetail } from '@/features/trip/tripDetailSchema';
import {
  canAddExpense,
  canEditTrip,
  canStartSettlement,
} from '@/features/trip/tripPermission';
import type { TripSettingsExit } from '@/features/trip/settings/tripSettings';
import { SettingFillIcon } from '@/shared/ui/icons';
import { NavigationHeader } from '@/shared/ui/NavigationHeader';
import { Toast } from '@/shared/ui/Toast';
import { COLORS } from '@/theme/theme.generated';

const TITLE = '여행방';

function leaveTripDetail(exitTo: TripSettingsExit) {
  if (exitTo === 'trips') {
    router.dismissTo('/trips');
    return;
  }
  if (exitTo !== 'back') return;
  if (router.canGoBack()) router.back();
  else router.replace('/trips');
}

function handlePressBack() {
  leaveTripDetail('back');
}

type TripDetailScreenProps = {
  tripId: string | undefined;
  isExpenseAddedToastVisible?: boolean;
  onDismissExpenseAddedToast?: () => void;
};

export function TripDetailScreen({
  tripId,
  isExpenseAddedToastVisible = false,
  onDismissExpenseAddedToast,
}: TripDetailScreenProps) {
  const tripQuery = useTripQuery(tripId);
  const trip = tripQuery.data;
  const notice = getTripDetailNotice({
    tripId,
    trip,
    error: tripQuery.isError ? tripQuery.error : null,
  });
  function handleDismissExpenseAddedToast() {
    onDismissExpenseAddedToast?.();
  }

  if (trip && !notice)
    return (
      <TripDetailContent
        trip={trip}
        isExpenseAddedToastVisible={isExpenseAddedToastVisible}
        onDismissExpenseAddedToast={handleDismissExpenseAddedToast}
      />
    );

  return <TripDetailPlaceholder notice={notice} />;
}

type TripDetailPlaceholderProps = {
  notice: TripDetailNotice | null;
};

function TripDetailPlaceholder({ notice }: TripDetailPlaceholderProps) {
  function handleDismissNotice() {
    if (notice) leaveTripDetail(notice.exitTo);
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      className="bg-surface-default flex-1"
    >
      <TripDetailBackground />
      <NavigationHeader title={TITLE} onPressBack={handlePressBack} />
      {notice ? (
        <Toast message={notice.message} onDismiss={handleDismissNotice} />
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS['action-primary-background']} />
        </View>
      )}
    </SafeAreaView>
  );
}

type TripDetailContentProps = {
  trip: TripDetail;
  isExpenseAddedToastVisible: boolean;
  onDismissExpenseAddedToast?: () => void;
};

function TripDetailContent({
  trip,
  isExpenseAddedToastVisible,
  onDismissExpenseAddedToast,
}: TripDetailContentProps) {
  const insets = useSafeAreaInsets();
  const hasBottomBar = canAddExpense(trip);
  function handleDismissExpenseAddedToast() {
    onDismissExpenseAddedToast?.();
  }

  function handlePressSettings() {
    router.push({
      pathname: '/trips/[tripId]/settings',
      params: { tripId: trip.tripId },
    });
  }

  function handlePressSettlement() {
    // TODO: 정산 대상 선택 화면이 생기면 이동
  }

  function handlePressAddExpense() {
    router.push({
      pathname: '/trips/[tripId]/expenses/new',
      params: { tripId: trip.tripId },
    });
  }

  const settingsButton = canEditTrip(trip) ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="여행방 설정"
      onPress={handlePressSettings}
      className="h-48 w-48 items-center justify-center"
    >
      <SettingFillIcon />
    </Pressable>
  ) : null;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="bg-surface-default flex-1"
    >
      <TripDetailBackground />
      <NavigationHeader
        title={TITLE}
        onPressBack={handlePressBack}
        right={settingsButton}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom:
            insets.bottom + (hasBottomBar ? TRIP_DETAIL_BOTTOM_BAR_HEIGHT : 24),
        }}
        contentContainerClassName="px-24 pt-14"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TripDetailHeading trip={trip} />
        <View className="mt-18">
          <TripShareSummary participants={trip.participants} />
        </View>
        <View className="mt-16 flex-1">
          <TripRecordSection trip={trip} />
        </View>
      </ScrollView>

      {hasBottomBar ? (
        <TripDetailBottomBar
          isSettlementVisible={canStartSettlement(trip)}
          onPressSettlement={handlePressSettlement}
          onPressAddExpense={handlePressAddExpense}
        />
      ) : null}
      {isExpenseAddedToastVisible && onDismissExpenseAddedToast ? (
        <Toast
          variant="compact"
          message="지출이 추가되었어요."
          onDismiss={handleDismissExpenseAddedToast}
        />
      ) : null}
    </SafeAreaView>
  );
}
