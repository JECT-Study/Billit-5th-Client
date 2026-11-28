import { useReducer, useState } from 'react';
import { View } from 'react-native';

import { TripExpenseFilterBar } from '@/features/trip/detail/components/TripExpenseFilterBar';
import {
  TripRecordTabs,
  type TripRecordTab,
} from '@/features/trip/detail/components/TripRecordTabs';
import { TripSettlementFilterChips } from '@/features/trip/detail/components/TripSettlementFilterChips';
import type { TripDetail } from '@/features/trip/tripDetailSchema';
import {
  ALL_EXPENSE_FILTER,
  tripExpenseFilterReducer,
} from '@/features/trip/detail/tripExpenseFilter';
import type { TripSettlementStatus } from '@/features/trip/detail/tripSettlementFilter';
import { Text } from '@/shared/ui/Text';

const EMPTY_MESSAGES: Record<TripRecordTab, string> = {
  EXPENSE: '아직 지출 내용이 없어요.\n첫 지출을 추가해보세요!',
  SETTLEMENT: '아직 정산 내용이 없어요.\n지출을 선택해 정산해보세요!',
};

type TripRecordSectionProps = {
  trip: Pick<TripDetail, 'startDate' | 'endDate'>;
};

export function TripRecordSection({ trip }: TripRecordSectionProps) {
  const [tab, setTab] = useState<TripRecordTab>('EXPENSE');
  const [expenseFilter, dispatchExpenseFilter] = useReducer(
    tripExpenseFilterReducer,
    ALL_EXPENSE_FILTER,
  );
  const [settlementStatus, setSettlementStatus] = useState<
    TripSettlementStatus | undefined
  >(undefined);
  // TODO(EXP-01): toExpenseDateQuery(expenseFilter)로 지출 목록을 조회한다.
  // TODO(SETTLE-08): toSettlementStatusQuery(settlementStatus)로 정산 목록을 조회한다.

  function handleChangeTab(nextTab: TripRecordTab) {
    setTab(nextTab);
  }

  function handleChangeSettlementStatus(
    status: TripSettlementStatus | undefined,
  ) {
    setSettlementStatus(status);
  }

  function handleSelectAllDates() {
    dispatchExpenseFilter({ type: 'SELECT_ALL' });
  }

  function handleSelectDate(date: string) {
    dispatchExpenseFilter({ type: 'SELECT_DATE', date });
  }

  function handleSelectRange(fromDate: string, toDate: string) {
    dispatchExpenseFilter({ type: 'SELECT_RANGE', fromDate, toDate });
  }

  function handleClearRange() {
    dispatchExpenseFilter({ type: 'CLEAR_RANGE' });
  }

  return (
    <View className="flex-1">
      <TripRecordTabs value={tab} onChange={handleChangeTab} />
      <View className="mt-18 z-10 h-[46px]">
        {tab === 'EXPENSE' ? (
          <TripExpenseFilterBar
            filter={expenseFilter}
            startDate={trip.startDate}
            endDate={trip.endDate}
            onSelectAll={handleSelectAllDates}
            onSelectDate={handleSelectDate}
            onSelectRange={handleSelectRange}
            onClearRange={handleClearRange}
          />
        ) : (
          <TripSettlementFilterChips
            value={settlementStatus}
            onChange={handleChangeSettlementStatus}
          />
        )}
      </View>
      <View className="flex-1 items-center justify-center py-40">
        <Text className="text-label-1 text-primary text-center font-medium">
          {EMPTY_MESSAGES[tab]}
        </Text>
      </View>
    </View>
  );
}
