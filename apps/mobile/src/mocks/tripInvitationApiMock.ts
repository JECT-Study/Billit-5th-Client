import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';

import type {
  TripInvitation,
  TripInvitationSearch,
  TripMembership,
} from '@/features/trip/invitation/tripInvitationSchema';
import { apiClient } from '@/lib/api';
import {
  parseRequestBody,
  toApiError,
  toNetworkError,
  toResponse,
} from '@/mocks/mockHttp';
import { addMockTrip, findMockTrip } from '@/mocks/tripApiMock';

type MockInvitationTrip = TripInvitationSearch & {
  countryCode: string;
  // 이 여행에서 이미 쓰고 있는 여행방 닉네임. 같은 닉네임으로 참여하면 409
  nicknames: string[];
};

type JoinRequest = { inviteCode: string; tripNickname: string };

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatIsoDate(date);
}

// 시뮬레이터에서 입력할 검색 코드별 여행. 이 밖의 코드는 404
const invitationTripsByCode = new Map<string, MockInvitationTrip>([
  [
    'JOIN01',
    {
      tripId: 'trip-invitation-join',
      name: '오사카 먹방 여행',
      countryCode: 'JP',
      startDate: addDays(20),
      endDate: addDays(23),
      registeredMemberCount: 1,
      memberCapacity: 6,
      status: 'UNCONFIRMED',
      isAlreadyJoined: false,
      nicknames: ['민지'],
    },
  ],
  [
    'MEMBER',
    {
      tripId: 'trip-inviting',
      name: '도쿄 여행',
      countryCode: 'JP',
      startDate: addDays(14),
      endDate: addDays(18),
      registeredMemberCount: 2,
      memberCapacity: 4,
      status: 'UNCONFIRMED',
      isAlreadyJoined: true,
      nicknames: ['민서', '지훈'],
    },
  ],
  [
    'FULL00',
    {
      tripId: 'trip-invitation-full',
      name: '방콕 여행',
      countryCode: 'TH',
      startDate: addDays(10),
      endDate: addDays(14),
      registeredMemberCount: 4,
      memberCapacity: 4,
      status: 'UNCONFIRMED',
      isAlreadyJoined: false,
      nicknames: ['하준', '서연', '도윤', '지우'],
    },
  ],
  [
    'CONF00',
    {
      tripId: 'trip-invitation-confirmed',
      name: '다낭 여행',
      countryCode: 'VN',
      startDate: addDays(7),
      endDate: addDays(10),
      registeredMemberCount: 2,
      memberCapacity: 4,
      status: 'CONFIRMED',
      isAlreadyJoined: false,
      nicknames: ['유나', '시우'],
    },
  ],
]);

const tripMemberIdsByTripId = new Map<string, string>([
  ['trip-inviting', 'trip-member-existing'],
]);
let nextTripMemberNumber = 1;

const inviteCodesByTripId = new Map<string, string>();
let nextInviteCodeNumber = 1;

// 실패 흐름을 시뮬레이터에서 보기 위한 값
const NETWORK_ERROR_CODE = 'NETERR';
const SERVER_ERROR_CODE = 'ERR500';
const JOIN_FAILURE_NICKNAME = '오류';
// 여행명에 이 글자가 들어간 여행은 초대 정보 첫 조회만 실패한다(공유 버튼으로 재조회 확인).
const SHARE_FAILURE_TRIP_NAME = '공유실패';
const failedInvitationTripIds = new Set<string>();

function findTripByCode(code: unknown) {
  if (typeof code !== 'string') return undefined;
  // 서버처럼 앞뒤 공백을 지우고 대소문자를 구분하지 않는다.
  return invitationTripsByCode.get(code.trim().toUpperCase());
}

function toSearchResult(trip: MockInvitationTrip): TripInvitationSearch {
  return {
    tripId: trip.tripId,
    name: trip.name,
    startDate: trip.startDate,
    endDate: trip.endDate,
    registeredMemberCount: trip.registeredMemberCount,
    memberCapacity: trip.memberCapacity,
    status: trip.status,
    isAlreadyJoined: trip.isAlreadyJoined,
  };
}

function getInviteCode(tripId: string) {
  const existing = inviteCodesByTripId.get(tripId);
  if (existing) return existing;

  const code = `INV${String(nextInviteCodeNumber).padStart(3, '0')}`;
  nextInviteCodeNumber += 1;
  inviteCodesByTripId.set(tripId, code);
  return code;
}

// 초대 링크가 가리킬 웹 랜딩 페이지 주소. 기본값은 apps/web의 pnpm dev 주소.
// Android 에뮬레이터에서는 Mac의 localhost가 10.0.2.2이므로 .env.local에서 바꿔 쓴다.
const webBaseUrl = (
  process.env.EXPO_PUBLIC_WEB_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

const invitationPathPattern = /^\/api\/v1\/trips\/([^/]+)\/invitation$/;
const searchPath = '/api/v1/trip-invitations';
const membershipPath = '/api/v1/trip-memberships';

const tripInvitationMockAdapter: AxiosAdapter = async (config) => {
  const invitationMatch = config.url?.match(invitationPathPattern);

  if (invitationMatch?.[1]) {
    const tripId = decodeURIComponent(invitationMatch[1]);
    const isShareFailureTrip =
      findMockTrip(tripId)?.name.includes(SHARE_FAILURE_TRIP_NAME) ?? false;
    if (isShareFailureTrip && !failedInvitationTripIds.has(tripId)) {
      failedInvitationTripIds.add(tripId);
      throw toNetworkError(config);
    }
    const inviteCode = getInviteCode(tripId);
    const invitation: TripInvitation = {
      inviteCode,
      inviteUrl: `${webBaseUrl}/invitations/${inviteCode}`,
    };
    return toResponse(config, { data: invitation });
  }

  if (config.url === searchPath) {
    const code = String(config.params?.code ?? '')
      .trim()
      .toUpperCase();
    if (code === NETWORK_ERROR_CODE) throw toNetworkError(config);
    if (code === SERVER_ERROR_CODE) {
      throw toApiError(
        config,
        500,
        'COMMON_INTERNAL_ERROR',
        '일시적인 오류가 발생했습니다.',
      );
    }
    const trip = findTripByCode(code);
    if (!trip) {
      throw toApiError(
        config,
        404,
        'TRIP_INVITATION_NOT_FOUND',
        '해당 코드로 검색 가능한 여행이 없습니다.',
      );
    }
    return toResponse(config, { data: toSearchResult(trip) });
  }

  // POST /api/v1/trip-memberships
  const request = parseRequestBody<JoinRequest>(config.data);
  if (request.tripNickname === JOIN_FAILURE_NICKNAME)
    throw toNetworkError(config);
  const trip = findTripByCode(request.inviteCode);

  if (!trip) {
    throw toApiError(
      config,
      404,
      'TRIP_INVITATION_NOT_FOUND',
      '초대 코드에 해당하는 여행이 없습니다.',
    );
  }

  const existingTripMemberId = tripMemberIdsByTripId.get(trip.tripId);
  if (trip.isAlreadyJoined && existingTripMemberId) {
    const membership: TripMembership = {
      tripId: trip.tripId,
      tripMemberId: existingTripMemberId,
    };
    return toResponse(config, { data: membership });
  }

  if (trip.status === 'CONFIRMED') {
    throw toApiError(
      config,
      409,
      'TRIP_ALREADY_CONFIRMED',
      '확정된 여행에는 참여할 수 없습니다.',
    );
  }
  if (trip.registeredMemberCount >= trip.memberCapacity) {
    throw toApiError(
      config,
      409,
      'TRIP_CAPACITY_FULL',
      '참여할 수 있는 자리가 없습니다.',
    );
  }
  if (trip.nicknames.includes(request.tripNickname)) {
    throw toApiError(
      config,
      409,
      'TRIP_NICKNAME_DUPLICATED',
      '이미 사용 중인 여행방 닉네임입니다.',
    );
  }

  const tripMemberId = `trip-member-${nextTripMemberNumber}`;
  nextTripMemberNumber += 1;
  tripMemberIdsByTripId.set(trip.tripId, tripMemberId);
  trip.nicknames.push(request.tripNickname);
  trip.registeredMemberCount += 1;
  trip.isAlreadyJoined = true;

  addMockTrip({
    tripId: trip.tripId,
    name: trip.name,
    countryCode: trip.countryCode,
    customCountryName: null,
    startDate: trip.startDate,
    endDate: trip.endDate,
    memberCapacity: trip.memberCapacity,
    registeredMemberCount: trip.registeredMemberCount,
    status: trip.status,
    myRole: 'MEMBER',
    myShareAmountKrw: '0.00',
  });

  const membership: TripMembership = { tripId: trip.tripId, tripMemberId };
  return toResponse(config, { data: membership }, 201);
};

function isTripInvitationRequest(config: InternalAxiosRequestConfig) {
  const url = config.url ?? '';
  const method = config.method?.toLowerCase();

  if (method === 'get') {
    return url === searchPath || invitationPathPattern.test(url);
  }
  return method === 'post' && url === membershipPath;
}

let isEnabled = false;

export function enableTripInvitationApiMocking() {
  if (isEnabled) return;

  apiClient.interceptors.request.use((config) => {
    if (isTripInvitationRequest(config)) {
      config.adapter = tripInvitationMockAdapter;
    }
    return config;
  });
  isEnabled = true;
}
