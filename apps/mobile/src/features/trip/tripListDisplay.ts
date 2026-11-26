import type {
  TripListFilter,
  TripListItem,
  TripScheduleStatus,
} from '@/features/trip/tripListSchema';

export type TripDisplayStatus = TripScheduleStatus;

export const TRIP_STATUS_LABELS: Record<TripDisplayStatus, string> = {
  ONGOING: '진행중',
  INVITING: '초대중',
  UPCOMING: '예정',
  ENDED: '종료',
};

export type TripFilterOption = {
  label: string;
  filter: TripListFilter | undefined;
};

export const TRIP_FILTER_OPTIONS: TripFilterOption[] = [
  { label: '전체 여행방', filter: undefined },
  { label: '초대중', filter: 'INVITING' },
  { label: '예정', filter: 'UPCOMING' },
  { label: '종료', filter: 'ENDED' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function toDayNumber(isoDate: string) {
  return Math.floor(Date.parse(`${isoDate}T00:00:00Z`) / DAY_MS);
}

/** 여행 기간 중 지나간 비율(0~1). 기간 밖이면 0 또는 1. */
export function getTripElapsedRatio(
  trip: Pick<TripListItem, 'startDate' | 'endDate'>,
  today: string,
) {
  const start = toDayNumber(trip.startDate);
  const end = toDayNumber(trip.endDate);
  const current = toDayNumber(today);
  if (current <= start) return 0;
  if (current >= end) return 1;
  return (current - start) / (end - start);
}

/** 2026-10-24 → 2026.10.24 */
export function formatTripDate(isoDate: string) {
  return isoDate.replaceAll('-', '.');
}

export function formatTripDateRange(startDate: string, endDate: string) {
  return `${formatTripDate(startDate)}~${formatTripDate(endDate)}`;
}

export function formatKrw(amountKrw: string) {
  const [integerPart = '0'] = amountKrw.split('.');
  const sign = integerPart.startsWith('-') ? '-' : '';
  const digits = integerPart.replace('-', '');
  return `${sign}${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원`;
}

export function formatTripSpentAmount(amountKrw: string) {
  return `${formatKrw(amountKrw)} 사용`;
}

export function getTodayIsoDate(now: Date = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
