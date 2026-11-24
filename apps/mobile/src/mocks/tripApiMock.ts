import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';

import type {
  TripListFilter,
  TripListItem,
} from '@/features/trip/tripListSchema';
import type { CreateTripRequest } from '@/features/trip/services/tripCreationRequest';
import type { UpdateTripRequest } from '@/features/trip/services/tripUpdateRequest';
import {
  TRIP_COUNTRIES,
  type TripCountryCode,
  type TripCurrency,
} from '@/features/trip/tripCreationForm';
import type { Participant, TripDetail } from '@/features/trip/tripDetailSchema';
import type { TripSummary } from '@/features/trip/tripSummarySchema';
import { apiClient } from '@/lib/api';
import { parseRequestBody, toApiError, toResponse } from '@/mocks/mockHttp';

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatIsoDate(date);
}

const mockTrips: TripListItem[] = [
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
    // 기타 국가 여행. 설정 화면에서 「기타」와 국가명이 채워진 상태로 열린다.
    tripId: 'trip-etc',
    name: '방콕 배낭 여행',
    countryCode: 'ETC',
    customCountryName: '태국',
    startDate: addDays(40),
    endDate: addDays(45),
    memberCapacity: 3,
    registeredMemberCount: 1,
    status: 'UNCONFIRMED',
    myRole: 'ADMIN',
    myShareAmountKrw: '0.00',
  },
  {
    // 지출 기록이 있어 삭제하면 409 TRIP_RECORDS_EXIST
    tripId: 'trip-with-records',
    name: '오사카 먹방 여행',
    countryCode: 'JP',
    customCountryName: null,
    startDate: addDays(-2),
    endDate: addDays(1),
    memberCapacity: 3,
    registeredMemberCount: 3,
    status: 'CONFIRMED',
    myRole: 'ADMIN',
    myShareAmountKrw: '45000.00',
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
  ...Array.from({ length: 22 }, (_, index): TripListItem => ({
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
export function addMockTrip(trip: TripListItem) {
  mockTrips.unshift(trip);
}

/** 다른 목(초대 정보 등)에서 여행 정보를 찾는다. */
export function findMockTrip(tripId: string) {
  return mockTrips.find((trip) => trip.tripId === tripId);
}

type MockTripDetail = {
  baseCurrency: TripCurrency;
  participants: Participant[];
  hasRecords: boolean;
};

const DEFAULT_NICKNAMES = [
  '민서',
  '지훈',
  '서연',
  '도윤',
  '하준',
  '지우',
  '유나',
  '시우',
  '예린',
  '건우',
];

function toParticipant(
  tripId: string,
  index: number,
  overrides: Partial<Participant> = {},
): Participant {
  return {
    tripMemberId: `${tripId}-member-${index + 1}`,
    memberId: `member-${index + 1}`,
    tripNickname: DEFAULT_NICKNAMES[index % DEFAULT_NICKNAMES.length] ?? '',
    role: index === 0 ? 'ADMIN' : 'MEMBER',
    participantStatus: 'MEMBER',
    shareAmountKrw: '0.00',
    ...overrides,
  };
}

const tripIdsWithRecords = new Set(['trip-with-records']);

function createDefaultDetail(trip: TripListItem): MockTripDetail {
  return {
    baseCurrency:
      TRIP_COUNTRIES.find(({ code }) => code === trip.countryCode)?.currency ??
      'KRW',
    participants: Array.from(
      { length: trip.registeredMemberCount },
      (_, index) => toParticipant(trip.tripId, index),
    ),
    hasRecords: tripIdsWithRecords.has(trip.tripId),
  };
}

const mockTripDetails = new Map<string, MockTripDetail>([
  [
    // 나간 회원, 탈퇴 회원, 비로그인 참여자가 섞인 여행
    'trip-ongoing',
    {
      baseCurrency: 'USD',
      participants: [
        toParticipant('trip-ongoing', 0, { shareAmountKrw: '100000.00' }),
        toParticipant('trip-ongoing', 1, { shareAmountKrw: '80000.00' }),
        toParticipant('trip-ongoing', 2, {
          memberId: null,
          tripNickname: '게스트',
          participantStatus: 'GUEST',
        }),
        toParticipant('trip-ongoing', 3, { participantStatus: 'LEFT' }),
        toParticipant('trip-ongoing', 4, {
          memberId: null,
          tripNickname: '탈퇴한 사용자 1',
          participantStatus: 'WITHDRAWN',
        }),
        toParticipant('trip-ongoing', 5),
      ],
      hasRecords: false,
    },
  ],
  [
    'trip-inviting',
    {
      baseCurrency: 'JPY',
      // 초대 코드 목(MEMBER 코드)의 닉네임과 맞춘다.
      participants: [
        toParticipant('trip-inviting', 0, { tripNickname: '민서' }),
        toParticipant('trip-inviting', 1, { tripNickname: '지훈' }),
      ],
      hasRecords: false,
    },
  ],
  [
    'trip-etc',
    {
      baseCurrency: 'KRW',
      participants: [toParticipant('trip-etc', 0)],
      hasRecords: false,
    },
  ],
]);

function getMockTripDetail(trip: TripListItem) {
  const existing = mockTripDetails.get(trip.tripId);
  if (existing) return existing;

  const detail = createDefaultDetail(trip);
  mockTripDetails.set(trip.tripId, detail);
  return detail;
}

function toTripSummary(trip: TripListItem): TripSummary {
  const { myShareAmountKrw: _, ...rest } = trip;
  return {
    ...rest,
    countryCode: trip.countryCode as TripCountryCode,
    baseCurrency: getMockTripDetail(trip).baseCurrency,
  };
}

function toTripDetail(trip: TripListItem): TripDetail {
  return {
    ...toTripSummary(trip),
    participants: getMockTripDetail(trip).participants,
  };
}

const createdTripsByIdempotencyKey = new Map<string, TripSummary>();
let nextCreatedTripNumber = 1;

function matchesFilter(trip: TripListItem, filter: TripListFilter) {
  const today = formatIsoDate(new Date());

  if (filter === 'INVITING') return trip.status === 'UNCONFIRMED';
  if (filter === 'UPCOMING') {
    return trip.status === 'CONFIRMED' && trip.startDate > today;
  }
  return trip.status === 'CONFIRMED' && trip.endDate < today;
}

function handleCreateTrip(config: InternalAxiosRequestConfig) {
  const idempotencyKey = config.headers.get('Idempotency-Key')?.toString();
  const existingTrip = idempotencyKey
    ? createdTripsByIdempotencyKey.get(idempotencyKey)
    : undefined;

  if (existingTrip) {
    return toResponse(config, { data: existingTrip }, 201);
  }

  const request = parseRequestBody<CreateTripRequest>(config.data);
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
  mockTripDetails.set(tripId, {
    baseCurrency: request.baseCurrency,
    participants: [
      toParticipant(tripId, 0, { tripNickname: request.tripNickname }),
    ],
    hasRecords: false,
  });
  if (idempotencyKey) createdTripsByIdempotencyKey.set(idempotencyKey, trip);

  return toResponse(config, { data: trip }, 201);
}

function handleListTrips(config: InternalAxiosRequestConfig) {
  const page = Number(config.params?.page ?? 0);
  const size = Number(config.params?.size ?? 20);
  const filter = config.params?.filter as TripListFilter | undefined;
  const trips = filter
    ? mockTrips.filter((trip) => matchesFilter(trip, filter))
    : mockTrips;
  const start = page * size;

  return toResponse(config, {
    data: trips.slice(start, start + size),
    page: {
      page,
      size,
      totalElements: trips.length,
      hasNext: start + size < trips.length,
    },
  });
}

function toInvalidRequestError(
  config: InternalAxiosRequestConfig,
  message: string,
) {
  return toApiError(config, 400, 'COMMON_INVALID_REQUEST', message);
}

function handleUpdateTrip(
  config: InternalAxiosRequestConfig,
  trip: TripListItem,
) {
  const request = parseRequestBody<UpdateTripRequest>(config.data ?? '{}');

  if (Object.keys(request).length === 0) {
    throw toInvalidRequestError(config, '수정할 정보를 입력해주세요.');
  }
  if (request.memberCapacity !== undefined) {
    if (trip.status === 'CONFIRMED') {
      throw toApiError(
        config,
        409,
        'TRIP_CAPACITY_CHANGE_NOT_ALLOWED',
        '확정된 여행은 인원을 변경할 수 없습니다.',
      );
    }
    if (request.memberCapacity < trip.registeredMemberCount) {
      throw toApiError(
        config,
        409,
        'TRIP_CAPACITY_CHANGE_NOT_ALLOWED',
        '현재 참여 인원보다 적게 줄일 수 없습니다.',
      );
    }
  }

  const countryCode = request.countryCode ?? trip.countryCode;
  if (countryCode === 'ETC') {
    if (trip.countryCode !== 'ETC' && !request.customCountryName) {
      throw toInvalidRequestError(config, '국가명을 입력해주세요.');
    }
  } else if (request.customCountryName !== undefined) {
    throw toInvalidRequestError(
      config,
      '기타 국가만 국가명을 입력할 수 있습니다.',
    );
  }

  const startDate = request.startDate ?? trip.startDate;
  const endDate = request.endDate ?? trip.endDate;
  if (endDate < startDate) {
    throw toInvalidRequestError(config, '종료일은 시작일 이후여야 합니다.');
  }

  const detail = getMockTripDetail(trip);
  if (request.name !== undefined) trip.name = request.name;
  trip.countryCode = countryCode;
  trip.customCountryName =
    countryCode === 'ETC'
      ? (request.customCountryName ?? trip.customCountryName)
      : null;
  trip.startDate = startDate;
  trip.endDate = endDate;
  if (request.memberCapacity !== undefined) {
    trip.memberCapacity = request.memberCapacity;
  }
  if (request.baseCurrency !== undefined) {
    detail.baseCurrency = request.baseCurrency;
  }

  return toResponse(config, { data: toTripSummary(trip) });
}

function handleDeleteTrip(
  config: InternalAxiosRequestConfig,
  trip: TripListItem,
) {
  if (getMockTripDetail(trip).hasRecords) {
    throw toApiError(
      config,
      409,
      'TRIP_RECORDS_EXIST',
      '지출 또는 정산 기록이 있어 여행을 삭제할 수 없습니다.',
    );
  }

  mockTrips.splice(mockTrips.indexOf(trip), 1);
  mockTripDetails.delete(trip.tripId);
  return toResponse(config, undefined, 204);
}

function handleTripDetailRequest(
  config: InternalAxiosRequestConfig,
  tripId: string,
) {
  const method = config.method?.toLowerCase();
  const trip = findMockTrip(tripId);

  if (!trip) {
    throw toApiError(
      config,
      404,
      'COMMON_NOT_FOUND',
      '여행을 찾을 수 없습니다.',
    );
  }
  if (method === 'get') return toResponse(config, { data: toTripDetail(trip) });

  if (trip.myRole !== 'ADMIN') {
    throw toApiError(
      config,
      403,
      'COMMON_FORBIDDEN',
      '여행 관리자만 할 수 있습니다.',
    );
  }
  if (method === 'patch') return handleUpdateTrip(config, trip);
  return handleDeleteTrip(config, trip);
}

const tripPath = '/api/v1/trips';
const tripDetailPathPattern = /^\/api\/v1\/trips\/([^/]+)$/;

const tripMockAdapter: AxiosAdapter = async (config) => {
  const detailMatch = config.url?.match(tripDetailPathPattern);
  if (detailMatch?.[1]) {
    return handleTripDetailRequest(config, decodeURIComponent(detailMatch[1]));
  }

  if (config.method?.toLowerCase() === 'post') return handleCreateTrip(config);
  return handleListTrips(config);
};

function isTripRequest(config: InternalAxiosRequestConfig) {
  const url = config.url ?? '';
  const method = config.method?.toLowerCase() ?? '';

  if (url === tripPath) return method === 'get' || method === 'post';
  return (
    tripDetailPathPattern.test(url) &&
    ['get', 'patch', 'delete'].includes(method)
  );
}

let isEnabled = false;

export function enableTripApiMocking() {
  if (isEnabled) return;

  apiClient.interceptors.request.use((config) => {
    if (isTripRequest(config)) {
      config.adapter = tripMockAdapter;
    }
    return config;
  });
  isEnabled = true;
}
