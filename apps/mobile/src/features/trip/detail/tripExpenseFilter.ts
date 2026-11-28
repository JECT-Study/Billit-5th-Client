import { formatTripDate } from '@/features/trip/list/tripListDisplay';

export type TripExpenseFilter =
  | { type: 'ALL' }
  | { type: 'DATE'; date: string }
  | { type: 'RANGE'; fromDate: string; toDate: string };

export const ALL_EXPENSE_FILTER: TripExpenseFilter = { type: 'ALL' };

export type TripExpenseFilterAction =
  | { type: 'SELECT_ALL' }
  | { type: 'SELECT_DATE'; date: string }
  | { type: 'SELECT_RANGE'; fromDate: string; toDate: string }
  | { type: 'CLEAR_RANGE' };

export function tripExpenseFilterReducer(
  state: TripExpenseFilter,
  action: TripExpenseFilterAction,
): TripExpenseFilter {
  switch (action.type) {
    case 'SELECT_ALL':
      return ALL_EXPENSE_FILTER;
    case 'SELECT_DATE':
      return { type: 'DATE', date: action.date };
    case 'SELECT_RANGE': {
      const [fromDate, toDate] =
        action.fromDate <= action.toDate
          ? [action.fromDate, action.toDate]
          : [action.toDate, action.fromDate];
      return { type: 'RANGE', fromDate, toDate };
    }
    case 'CLEAR_RANGE':
      return state.type === 'RANGE' ? ALL_EXPENSE_FILTER : state;
  }
}

export type ExpenseDateQuery = {
  fromDate?: string;
  toDate?: string;
};

export function toExpenseDateQuery(
  filter: TripExpenseFilter,
): ExpenseDateQuery {
  switch (filter.type) {
    case 'ALL':
      return {};
    case 'DATE':
      return { fromDate: filter.date, toDate: filter.date };
    case 'RANGE':
      return { fromDate: filter.fromDate, toDate: filter.toDate };
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcTime(isoDate: string) {
  return Date.parse(`${isoDate}T00:00:00Z`);
}

export function getTripDates(startDate: string, endDate: string) {
  const start = toUtcTime(startDate);
  const end = toUtcTime(endDate);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return [];

  const dates: string[] = [];
  for (let time = start; time <= end; time += DAY_MS) {
    dates.push(new Date(time).toISOString().slice(0, 10));
  }
  return dates;
}

export const ALL_EXPENSE_DATE_VALUE = 'ALL';
const ALL_EXPENSE_DATE_LABEL = '전체';

export type ExpenseDateOption = {
  value: string;
  label: string;
};

export function getExpenseDateOptions(
  startDate: string,
  endDate: string,
): ExpenseDateOption[] {
  return [
    { value: ALL_EXPENSE_DATE_VALUE, label: ALL_EXPENSE_DATE_LABEL },
    ...getTripDates(startDate, endDate).map((date) => ({
      value: date,
      label: formatTripDate(date),
    })),
  ];
}

/** 드롭다운에서 체크할 값. 기간을 고른 동안에는 「전체」다. */
export function getSelectedExpenseDateValue(filter: TripExpenseFilter) {
  return filter.type === 'DATE' ? filter.date : ALL_EXPENSE_DATE_VALUE;
}

/** 드롭다운 칸에 보일 글자 */
export function formatExpenseDateLabel(filter: TripExpenseFilter) {
  return filter.type === 'DATE'
    ? formatTripDate(filter.date)
    : ALL_EXPENSE_DATE_LABEL;
}

export const EXPENSE_RANGE_PLACEHOLDER = '기간 선택';

/**
 * 기간 선택 칸에 보일 글자. 칸이 좁아서 짧게 쓴다.
 * - 같은 해: 10.22~10.25
 * - 해가 다름: 25.12.30~26.01.02
 * - 하루: 10.22
 */
export function formatExpenseRangeLabel(filter: TripExpenseFilter) {
  if (filter.type !== 'RANGE') return EXPENSE_RANGE_PLACEHOLDER;

  const { fromDate, toDate } = filter;
  const isSameYear = fromDate.slice(0, 4) === toDate.slice(0, 4);
  // 2026.10.22 → 같은 해면 10.22, 다른 해면 26.10.22
  const shorten = (date: string) =>
    formatTripDate(date).slice(isSameYear ? 5 : 2);

  if (fromDate === toDate) return shorten(fromDate);
  return `${shorten(fromDate)}~${shorten(toDate)}`;
}
