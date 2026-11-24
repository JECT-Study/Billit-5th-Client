import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import type {
  TripListFilter,
  TripListItem,
  TripScheduleStatus,
} from '@/features/trip/tripListSchema';
import type { CreateTripRequest } from '@/features/trip/services/tripCreationRequest';
import type { TripSummary } from '@/features/trip/tripSummarySchema';
import { apiClient } from '@/lib/api';

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatIsoDate(date);
}

type MockTrip = Omit<TripListItem, 'scheduleStatus'>;

const mockTrips: MockTrip[] = [
  {
    tripId: 'trip-ongoing',
    name: '샌프란시스코 10박 12일 여행',
    countryCode: 'US',
    customCountryName: null,
    startDate: addDays(-3),
    endDate: addDays(8),
    memberCapacity: 6,
    registeredMemberCount: 6,
    status: 'CONFIRMED',
    myRole: 'ADMIN',
    myShareAmountKrw: '100000.00',
  },
  {
    tripId: 'trip-ongoing-2',
    name: '삿포로 겨울 여행',
    countryCode: 'JP',
    customCountryName: null,
    startDate: addDays(-1),
    endDate: addDays(4),
    memberCapacity: 4,
    registeredMemberCount: 4,
    status: 'CONFIRMED',
    myRole: 'MEMBER',
    myShareAmountKrw: '75000.00',
  },
  {
    tripId: 'trip-ongoing-3',
    name: '제주도 주말 여행',
    countryCode: 'KR',
    customCountryName: null,
    startDate: addDays(-5),
    endDate: addDays(2),
    memberCapacity: 5,
    registeredMemberCount: 5,
    status: 'CONFIRMED',
    myRole: 'ADMIN',
    myShareAmountKrw: '120000.00',
  },
  {
    tripId: 'trip-inviting',
    name: '도쿄 여행',
    countryCode: 'JP',
    customCountryName: null,
    startDate: addDays(14),
    endDate: addDays(18),
    memberCapacity: 4,
    registeredMemberCount: 2,
    status: 'UNCONFIRMED',
    myRole: 'ADMIN',
    myShareAmountKrw: '0.00',
  },
  {
    tripId: 'trip-upcoming',
    name: '파리 여행',
    countryCode: 'EU',
    customCountryName: null,
    startDate: addDays(30),
    endDate: addDays(36),
    memberCapacity: 3,
    registeredMemberCount: 3,
    status: 'CONFIRMED',
    myRole: 'MEMBER',
    myShareAmountKrw: '0.00',
  },
  ...Array.from({ length: 22 }, (_, index): MockTrip => ({
    tripId: `trip-ended-${index + 1}`,
    name: `지난 여행 ${index + 1}`,
    countryCode: 'KR',
    customCountryName: null,
    startDate: addDays(-30 - index * 3),
    endDate: addDays(-28 - index * 3),
    memberCapacity: 2,
    registeredMemberCount: 2,
    status: 'CONFIRMED',
    myRole: 'MEMBER',
    myShareAmountKrw: '50000.00',
  })),
];

/** 다른 목(초대 참여 등)에서 만든 여행을 목록 맨 앞에 추가한다. */
export function addMockTrip(trip: MockTrip) {
  mockTrips.unshift(trip);
}

/** 다른 목(초대 정보 등)에서 여행 정보를 찾는다. */
export function findMockTrip(tripId: string) {
  return mockTrips.find((trip) => trip.tripId === tripId);
}

const createdTripsByIdempotencyKey = new Map<string, TripSummary>();
let nextCreatedTripNumber = 1;

function getScheduleStatus(
  trip: Pick<MockTrip, 'status' | 'startDate' | 'endDate'>,
  today: string,
): TripScheduleStatus {
  if (trip.status === 'UNCONFIRMED') return 'INVITING';
  if (trip.endDate < today) return 'ENDED';
  if (trip.startDate > today) return 'UPCOMING';
  return 'ONGOING';
}

function toTripListItem(trip: MockTrip, today: string): TripListItem {
  return { ...trip, scheduleStatus: getScheduleStatus(trip, today) };
}

function matchesFilter(trip: MockTrip, filter: TripListFilter, today: string) {
  return getScheduleStatus(trip, today) === filter;
}

function toResponse<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
): AxiosResponse<T> {
  return {
    config,
    data,
    headers: {},
    request: {},
    status,
    statusText: status === 201 ? 'Created' : 'OK',
  };
}

function toCreateTripRequest(data: unknown): CreateTripRequest {
  return typeof data === 'string'
    ? (JSON.parse(data) as CreateTripRequest)
    : (data as CreateTripRequest);
}

const tripMockAdapter: AxiosAdapter = async (config) => {
  const method = config.method?.toLowerCase();

  if (method === 'post') {
    const idempotencyKey = config.headers.get('Idempotency-Key')?.toString();
    const existingTrip = idempotencyKey
      ? createdTripsByIdempotencyKey.get(idempotencyKey)
      : undefined;

    if (existingTrip) {
      return toResponse(config, { data: existingTrip }, 201);
    }

    const request = toCreateTripRequest(config.data);
    const tripId = `trip-created-${nextCreatedTripNumber}`;
    nextCreatedTripNumber += 1;
    const trip: TripSummary = {
      tripId,
      name: request.name,
      countryCode: request.countryCode,
      customCountryName: request.customCountryName ?? null,
      startDate: request.startDate,
      endDate: request.endDate,
      baseCurrency: request.baseCurrency,
      memberCapacity: request.memberCapacity,
      registeredMemberCount: 1,
      status: 'UNCONFIRMED',
      myRole: 'ADMIN',
    };

    mockTrips.unshift({ ...trip, myShareAmountKrw: '0.00' });
    if (idempotencyKey) createdTripsByIdempotencyKey.set(idempotencyKey, trip);

    return toResponse(config, { data: trip }, 201);
  }

  const page = Number(config.params?.page ?? 0);
  const size = Number(config.params?.size ?? 20);
  const filter = config.params?.filter as TripListFilter | undefined;
  const today = config.params?.today as string;
  const trips = filter
    ? mockTrips.filter((trip) => matchesFilter(trip, filter, today))
    : mockTrips;
  const start = page * size;

  return toResponse(config, {
    data: trips
      .slice(start, start + size)
      .map((trip) => toTripListItem(trip, today)),
    page: {
      page,
      size,
      totalElements: trips.length,
      hasNext: start + size < trips.length,
    },
  });
};

function isTripListRequest(config: InternalAxiosRequestConfig) {
  return config.url === '/api/v1/trips';
}

let isEnabled = false;

export function enableTripApiMocking() {
  if (isEnabled) return;

  apiClient.interceptors.request.use((config) => {
    if (isTripListRequest(config)) {
      config.adapter = tripMockAdapter;
    }
    return config;
  });
  isEnabled = true;
}
