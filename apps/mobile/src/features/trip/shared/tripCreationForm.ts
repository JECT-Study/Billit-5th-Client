import { CURRENCY_CODES, CURRENCY_FULL_OPTIONS } from '@/shared/currency';
import type { Currency } from '@/shared/currency';

export const TRIP_COUNTRY_CODES = [
  'KR',
  'JP',
  'EU',
  'US',
  'CN',
  'ETC',
] as const;
export const TRIP_CURRENCY_CODES = CURRENCY_CODES;

export type TripCountryCode = (typeof TRIP_COUNTRY_CODES)[number];
export type TripCurrency = Currency;

export type TripCreationDraft = {
  name: string;
  countryCode: TripCountryCode | null;
  customCountryName: string;
  baseCurrency: TripCurrency;
  startDate: string;
  endDate: string;
  memberCapacity: number | null;
  nickname: string;
};

export const INITIAL_TRIP_DRAFT: TripCreationDraft = {
  name: '',
  countryCode: null,
  customCountryName: '',
  baseCurrency: 'KRW',
  startDate: '',
  endDate: '',
  memberCapacity: null,
  nickname: '',
};

export const TRIP_COUNTRIES: {
  code: TripCountryCode;
  label: string;
  currency: TripCurrency;
}[] = [
  { code: 'KR', label: '한국', currency: 'KRW' },
  { code: 'JP', label: '일본', currency: 'JPY' },
  { code: 'EU', label: '유럽', currency: 'EUR' },
  { code: 'US', label: '미국', currency: 'USD' },
  { code: 'CN', label: '중국', currency: 'CNY' },
  { code: 'ETC', label: '기타 (직접 입력)', currency: 'KRW' },
];

export const TRIP_CURRENCIES = CURRENCY_FULL_OPTIONS;

export type TripCreationStep = 0 | 1 | 2 | 3 | 4 | 5;
