export type TripSettlementStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

export type TripSettlementFilterOption = {
  label: string;
  status: TripSettlementStatus | undefined;
};

export const TRIP_SETTLEMENT_FILTER_OPTIONS: readonly TripSettlementFilterOption[] =
  [
    { label: '전체', status: undefined },
    { label: '정산중', status: 'IN_PROGRESS' },
    { label: '정산완료', status: 'COMPLETED' },
    { label: '취소됨', status: 'CANCELED' },
  ];

export type SettlementStatusQuery = {
  status?: TripSettlementStatus;
};

export function toSettlementStatusQuery(
  status: TripSettlementStatus | undefined,
): SettlementStatusQuery {
  return status ? { status } : {};
}
