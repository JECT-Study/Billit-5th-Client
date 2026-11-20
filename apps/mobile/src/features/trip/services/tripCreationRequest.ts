import type {
  TripCountryCode,
  TripCurrency,
} from '@/features/trip/tripCreationForm';
import type { TripCreationValues } from '@/features/trip/tripCreationSchema';

type CreateTripRequestBase = {
  name: string;
  baseCurrency: TripCurrency;
  startDate: string;
  endDate: string;
  memberCapacity: number;
  nickname: string;
};

export type CreateTripRequest = CreateTripRequestBase &
  (
    | {
        countryCode: Exclude<TripCountryCode, 'ETC'>;
        customCountryName?: never;
      }
    | { countryCode: 'ETC'; customCountryName: string }
  );

export function toCreateTripRequest(
  values: TripCreationValues,
): CreateTripRequest {
  const base = {
    name: values.name,
    baseCurrency: values.baseCurrency,
    startDate: values.startDate,
    endDate: values.endDate,
    memberCapacity: values.memberCapacity,
    nickname: values.nickname,
  };

  if (values.countryCode === 'ETC') {
    return {
      ...base,
      countryCode: 'ETC',
      customCountryName: values.customCountryName.trim(),
    };
  }

  return { ...base, countryCode: values.countryCode };
}

export type TripCreationAttempt = {
  requestSignature: string;
  idempotencyKey: string;
};

// 응답을 받지 못한 동일한 요청은 같은 키로 재시도하고, 입력이 바뀌면 새 키를 쓴다.
export function getTripCreationAttempt(
  request: CreateTripRequest,
  previous: TripCreationAttempt | null,
  createKey: () => string,
): TripCreationAttempt {
  const requestSignature = JSON.stringify(request);
  if (previous?.requestSignature === requestSignature) return previous;
  return { requestSignature, idempotencyKey: createKey() };
}
