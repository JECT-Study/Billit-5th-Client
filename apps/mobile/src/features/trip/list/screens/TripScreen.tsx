import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  AppState,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InviteCodeDialog } from '@/features/trip/invitation/components/InviteCodeDialog';
import { TripCardStack } from '@/features/trip/list/components/TripCardStack';
import { TripKebabMenu } from '@/features/trip/list/components/TripKebabMenu';
import { TripEmptyState } from '@/features/trip/list/components/TripEmptyState';
import { TripFilterTabs } from '@/features/trip/list/components/TripFilterTabs';
import { TripHomeHeader } from '@/features/trip/list/components/TripHomeHeader';
import { TripListItem } from '@/features/trip/list/components/TripListItem';
import { useInviteCodeDialogOnSignup } from '@/features/trip/invitation/hooks/useInviteCodeDialogOnSignup';
import { useTripListQuery } from '@/features/trip/list/hooks/useTripListQuery';
import { getTodayIsoDate } from '@/features/trip/list/tripListDisplay';
import type {
  TripListFilter,
  TripListItem as TripListItemData,
} from '@/features/trip/list/tripListSchema';
import { canOpenTripDetail } from '@/features/trip/tripPermission';
import { Button } from '@/shared/ui/Button';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { MoreIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

// 토큰에 없는 빈 상태 화면 배경 끝 색 (Figma: 여행방 없음, 3037:54776)
const EMPTY_STATE_GRADIENT_END_COLOR = '#CEEEFF';

let nextListSession = 0;

type Props = { onOpenParticipantSheet: (tripId: string) => void };

export function TripScreen({ onOpenParticipantSheet }: Props) {
  const [filter, setFilter] = useState<TripListFilter | undefined>(undefined);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const inviteCodeDialogState = useInviteCodeDialogOnSignup();
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [listSession, setListSession] = useState(() => ({
    today: getTodayIsoDate(),
    id: ++nextListSession,
    isManualRefresh: false,
  }));
  const hasFocused = useRef(false);
  const { today, id: sessionId } = listSession;
  const tripListQuery = useTripListQuery(today, filter, sessionId);
  const ongoingTripListQuery = useTripListQuery(today, 'ONGOING', sessionId);

  const handleRefreshList = useCallback(() => {
    setListSession({
      today: getTodayIsoDate(),
      id: ++nextListSession,
      isManualRefresh: false,
    });
    setActiveCarouselIndex(0);
  }, []);

  function handlePullToRefresh() {
    setListSession({
      today: getTodayIsoDate(),
      id: ++nextListSession,
      isManualRefresh: true,
    });
    setActiveCarouselIndex(0);
  }

  useFocusEffect(
    useCallback(() => {
      if (hasFocused.current) handleRefreshList();
      hasFocused.current = true;
      let previousState = AppState.currentState;
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active' && previousState !== 'active')
          handleRefreshList();
        previousState = state;
      });
      return () => subscription.remove();
    }, [handleRefreshList]),
  );

  const trips = useMemo(
    () => tripListQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [tripListQuery.data],
  );
  const ongoingTrips = useMemo(
    () => ongoingTripListQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [ongoingTripListQuery.data],
  );
  const activeOngoingTripIndex = Math.min(
    activeCarouselIndex,
    Math.max(ongoingTrips.length - 1, 0),
  );
  const isEmpty = !tripListQuery.isPending && trips.length === 0;
  const isInitialLoading = filter === undefined && tripListQuery.isPending;

  function handlePressNotification() {
    // TODO: 알림 화면이 생기면 이동
  }

  function handlePressCreateTrip() {
    router.push('/trips/new');
  }

  function handlePressJoinWithInviteCode() {
    setIsMenuOpen(false);
    inviteCodeDialogState.open();
  }

  function handleCloseInviteCodeDialog() {
    inviteCodeDialogState.close();
  }

  const inviteCodeDialog = inviteCodeDialogState.isOpen ? (
    <InviteCodeDialog onClose={handleCloseInviteCodeDialog} />
  ) : null;

  // 시작된 여행은 여행방 상세로, 초대중(확정 전) 여행은 참여 현황 시트를 연다.
  function handlePressTrip(trip: TripListItemData) {
    if (canOpenTripDetail(trip)) {
      router.push({
        pathname: '/trips/[tripId]',
        params: { tripId: trip.tripId },
      });
      return;
    }
    onOpenParticipantSheet(trip.tripId);
  }

  function handlePressMore() {
    setIsMenuOpen((current) => !current);
  }

  function handleCloseMenu() {
    setIsMenuOpen(false);
  }

  function handlePressMenuCreateTrip() {
    setIsMenuOpen(false);
    router.push('/trips/new');
  }

  function handleChangeFilter(nextFilter: TripListFilter | undefined) {
    setListSession((current) => ({ ...current, isManualRefresh: false }));
    setFilter(nextFilter);
  }

  function handleChangeCardIndex(index: number) {
    setActiveCarouselIndex(index);
  }

  // 바닥 근처까지 내려오면 다음 페이지를 불러온다
  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - contentOffset.y - layoutMeasurement.height;
    if (
      distanceFromBottom < 200 &&
      tripListQuery.hasNextPage &&
      !tripListQuery.isFetching &&
      !tripListQuery.isShowingPreviousData
    ) {
      void tripListQuery.fetchNextPage();
    }
  }

  if (isInitialLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1">
        <GradientBackground />
        <TripHomeHeader onPressNotification={handlePressNotification} />
        <View className="bg-surface-default flex-1" />
        {inviteCodeDialog}
      </SafeAreaView>
    );
  }

  // 전체 여행 목록이 비었을 때는 기존 첫 여행방 안내
  if (isEmpty && filter === undefined) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1">
        <GradientBackground endColor={EMPTY_STATE_GRADIENT_END_COLOR} />
        <TripHomeHeader onPressNotification={handlePressNotification} />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={
                listSession.isManualRefresh && tripListQuery.isFetching
              }
              onRefresh={handlePullToRefresh}
            />
          }
        >
          <TripEmptyState
            onPressCreateTrip={handlePressCreateTrip}
            onPressJoinWithInviteCode={handlePressJoinWithInviteCode}
          />
        </ScrollView>
        {inviteCodeDialog}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1">
      <GradientBackground />
      <TripHomeHeader onPressNotification={handlePressNotification} />
      <ScrollView
        className="bg-surface-default flex-1"
        contentContainerClassName="pb-[120px]"
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl
            refreshing={
              listSession.isManualRefresh &&
              tripListQuery.isFetching &&
              !tripListQuery.isFetchingNextPage
            }
            onRefresh={handlePullToRefresh}
          />
        }
        removeClippedSubviews={false}
        scrollEventThrottle={100}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View
          collapsable={false}
          className="bg-surface-default px-24 pb-8 pt-4"
          style={{ elevation: 1, zIndex: 1 }}
        >
          {ongoingTrips.length > 0 ? (
            <>
              <TripCardStack
                trips={ongoingTrips}
                activeIndex={activeOngoingTripIndex}
                onChangeIndex={handleChangeCardIndex}
                onPressTrip={handlePressTrip}
              />
              <View className="mt-4 flex-row items-center justify-center gap-6">
                {ongoingTrips.map((trip, index) => (
                  <View
                    key={trip.tripId}
                    className={`rounded-100 h-6 w-6 ${
                      index === activeOngoingTripIndex
                        ? 'bg-black'
                        : 'bg-gray-4'
                    }`}
                  />
                ))}
              </View>
            </>
          ) : (
            // 진행중인 여행이 없을 때 상단 생성 CTA를 보여준다.
            <View className="mt-32 gap-10">
              <Text className="text-caption-1 text-gray-4 text-center font-semibold">
                아직 진행 중인 여행이 없어요.
              </Text>
              <Button
                label="새 여행방 만들기"
                onPress={handlePressCreateTrip}
              />
            </View>
          )}

          <View className={ongoingTrips.length > 0 ? 'mt-32' : 'mt-36'}>
            <TripFilterTabs value={filter} onChange={handleChangeFilter} />
          </View>
        </View>

        <View className="gap-[2px] px-24 pt-8">
          {trips.map((trip) => (
            <TripListItem
              key={trip.tripId}
              trip={trip}
              today={today}
              onPress={handlePressTrip}
            />
          ))}
        </View>
      </ScrollView>

      {isMenuOpen ? (
        <Pressable
          accessibilityLabel="메뉴 닫기"
          onPress={handleCloseMenu}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <View
        pointerEvents="box-none"
        className="absolute bottom-24 right-24 items-end gap-[3px]"
      >
        {isMenuOpen ? (
          <TripKebabMenu
            onPressCreateTrip={handlePressMenuCreateTrip}
            onPressJoinWithInviteCode={handlePressJoinWithInviteCode}
          />
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="더보기"
          accessibilityState={{ expanded: isMenuOpen }}
          onPress={handlePressMore}
          className="bg-gray-8 rounded-100 p-10"
        >
          <MoreIcon color={COLORS.white} />
        </Pressable>
      </View>
      {inviteCodeDialog}
    </SafeAreaView>
  );
}
