export const TRIP_COUNTRY_CODES = [
  'KR',
  'JP',
  'EU',
  'US',
  'CN',
  'ETC',
] as const;
export const TRIP_CURRENCY_CODES = ['KRW', 'JPY', 'EUR', 'USD', 'CNY'] as const;

export type TripCountryCode = (typeof TRIP_COUNTRY_CODES)[number];
export type TripCurrency = (typeof TRIP_CURRENCY_CODES)[number];

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

export const TRIP_CURRENCIES: { code: TripCurrency; label: string }[] = [
  { code: 'KRW', label: '한국 (원) KRW' },
  { code: 'JPY', label: '일본 (엔) JPY' },
  { code: 'EUR', label: '유럽 (유로) EUR' },
  { code: 'USD', label: '미국 (달러) USD' },
  { code: 'CNY', label: '중국 (위안) CNY' },
];

export type TripCreationStep = 0 | 1 | 2 | 3 | 4 | 5;
