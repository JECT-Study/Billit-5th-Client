import {
  ALL_EXPENSE_FILTER,
  formatExpenseDateLabel,
  formatExpenseRangeLabel,
  getExpenseDateOptions,
  getSelectedExpenseDateValue,
  getTripDates,
  toExpenseDateQuery,
  tripExpenseFilterReducer,
  type TripExpenseFilter,
} from '@/features/trip/detail/tripExpenseFilter';

const dateFilter: TripExpenseFilter = { type: 'DATE', date: '2026-10-23' };
const rangeFilter: TripExpenseFilter = {
  type: 'RANGE',
  fromDate: '2026-10-22',
  toDate: '2026-10-25',
};

describe('tripExpenseFilterReducer', () => {
  it('날짜를 고르면 날짜 하나 필터가 되고, 고른 기간은 풀린다', () => {
    expect(
      tripExpenseFilterReducer(rangeFilter, {
        type: 'SELECT_DATE',
        date: '2026-10-23',
      }),
    ).toEqual(dateFilter);
  });

  it('기간을 고르면 기간 필터가 되고, 고른 날짜는 풀린다', () => {
    expect(
      tripExpenseFilterReducer(dateFilter, {
        type: 'SELECT_RANGE',
        fromDate: '2026-10-22',
        toDate: '2026-10-25',
      }),
    ).toEqual(rangeFilter);
  });

  it('기간의 시작과 끝이 거꾸로 오면 바로잡는다', () => {
    expect(
      tripExpenseFilterReducer(ALL_EXPENSE_FILTER, {
        type: 'SELECT_RANGE',
        fromDate: '2026-10-25',
        toDate: '2026-10-22',
      }),
    ).toEqual(rangeFilter);
  });

  it('드롭다운에서 전체를 고르면 어떤 필터든 전체가 된다', () => {
    for (const state of [dateFilter, rangeFilter, ALL_EXPENSE_FILTER]) {
      expect(tripExpenseFilterReducer(state, { type: 'SELECT_ALL' })).toEqual(
        ALL_EXPENSE_FILTER,
      );
    }
  });

  it('기간의 ✕를 누르면 전체로 돌아간다', () => {
    expect(
      tripExpenseFilterReducer(rangeFilter, { type: 'CLEAR_RANGE' }),
    ).toEqual(ALL_EXPENSE_FILTER);
  });

  it('기간이 아닐 때 ✕는 고른 날짜를 건드리지 않는다', () => {
    expect(tripExpenseFilterReducer(dateFilter, { type: 'CLEAR_RANGE' })).toBe(
      dateFilter,
    );
  });
});

describe('toExpenseDateQuery', () => {
  it('전체는 fromDate와 toDate를 모두 생략한다', () => {
    expect(toExpenseDateQuery(ALL_EXPENSE_FILTER)).toEqual({});
  });

  it('날짜 하나는 fromDate와 toDate가 같다', () => {
    expect(toExpenseDateQuery(dateFilter)).toEqual({
      fromDate: '2026-10-23',
      toDate: '2026-10-23',
    });
  });

  it('기간은 시작일과 종료일을 그대로 보낸다', () => {
    expect(toExpenseDateQuery(rangeFilter)).toEqual({
      fromDate: '2026-10-22',
      toDate: '2026-10-25',
    });
  });
});

describe('getTripDates', () => {
  it('시작일과 종료일을 포함한 모든 날짜를 만든다', () => {
    expect(getTripDates('2026-11-10', '2026-11-12')).toEqual([
      '2026-11-10',
      '2026-11-11',
      '2026-11-12',
    ]);
  });

  it('당일 여행은 하루만 만든다', () => {
    expect(getTripDates('2026-11-10', '2026-11-10')).toEqual(['2026-11-10']);
  });

  it('달과 해를 넘겨도 이어서 센다', () => {
    expect(getTripDates('2026-12-30', '2027-01-02')).toEqual([
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
    ]);
  });

  it('윤년 2월 29일을 넣는다', () => {
    expect(getTripDates('2028-02-28', '2028-03-01')).toEqual([
      '2028-02-28',
      '2028-02-29',
      '2028-03-01',
    ]);
  });

  it('종료일이 시작일보다 앞서면 빈 목록이다', () => {
    expect(getTripDates('2026-11-12', '2026-11-10')).toEqual([]);
  });
});

describe('날짜 드롭다운', () => {
  it('전체 다음에 여행 기간의 날짜를 둔다', () => {
    expect(getExpenseDateOptions('2026-11-10', '2026-11-11')).toEqual([
      { value: 'ALL', label: '전체' },
      { value: '2026-11-10', label: '2026.11.10' },
      { value: '2026-11-11', label: '2026.11.11' },
    ]);
  });

  it.each([
    [ALL_EXPENSE_FILTER, 'ALL', '전체'],
    [dateFilter, '2026-10-23', '2026.10.23'],
    [rangeFilter, 'ALL', '전체'],
  ] as const)('%o: 선택 %s, 글자 %s', (filter, value, label) => {
    expect(getSelectedExpenseDateValue(filter)).toBe(value);
    expect(formatExpenseDateLabel(filter)).toBe(label);
  });
});

describe('formatExpenseRangeLabel', () => {
  it('기간이 아니면 기간 선택을 보여 준다', () => {
    expect(formatExpenseRangeLabel(ALL_EXPENSE_FILTER)).toBe('기간 선택');
    expect(formatExpenseRangeLabel(dateFilter)).toBe('기간 선택');
  });

  it('같은 해면 월.일만 쓴다', () => {
    expect(formatExpenseRangeLabel(rangeFilter)).toBe('10.22~10.25');
  });

  it('해가 다르면 두 자리 연도를 붙인다', () => {
    expect(
      formatExpenseRangeLabel({
        type: 'RANGE',
        fromDate: '2026-12-30',
        toDate: '2027-01-02',
      }),
    ).toBe('26.12.30~27.01.02');
  });

  it('하루만 고르면 그 날짜 하나만 쓴다', () => {
    expect(
      formatExpenseRangeLabel({
        type: 'RANGE',
        fromDate: '2026-10-22',
        toDate: '2026-10-22',
      }),
    ).toBe('10.22');
  });
});
