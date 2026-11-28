import {
  TRIP_SETTLEMENT_FILTER_OPTIONS,
  toSettlementStatusQuery,
} from '@/features/trip/detail/tripSettlementFilter';

describe('tripSettlementFilter', () => {
  it('칩은 전체 / 정산중 / 정산완료 / 취소됨 순서다', () => {
    expect(TRIP_SETTLEMENT_FILTER_OPTIONS).toEqual([
      { label: '전체', status: undefined },
      { label: '정산중', status: 'IN_PROGRESS' },
      { label: '정산완료', status: 'COMPLETED' },
      { label: '취소됨', status: 'CANCELED' },
    ]);
  });

  it('전체는 status를 보내지 않는다', () => {
    expect(toSettlementStatusQuery(undefined)).toEqual({});
  });

  it.each(['IN_PROGRESS', 'COMPLETED', 'CANCELED'] as const)(
    '%s는 그대로 보낸다',
    (status) => {
      expect(toSettlementStatusQuery(status)).toEqual({ status });
    },
  );
});
