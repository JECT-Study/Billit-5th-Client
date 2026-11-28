export const CURRENCY_CODES = ['KRW', 'JPY', 'EUR', 'USD', 'CNY'] as const;

export type Currency = (typeof CURRENCY_CODES)[number];

const CURRENCY_DETAILS: Record<
  Currency,
  { region: string; unit: string; symbol: string }
> = {
  KRW: { region: '한국', unit: '원', symbol: '₩' },
  JPY: { region: '일본', unit: '엔', symbol: '¥' },
  EUR: { region: '유럽', unit: '유로', symbol: '€' },
  USD: { region: '미국', unit: '달러', symbol: '$' },
  CNY: { region: '중국', unit: '위안', symbol: '¥' },
};

export const CURRENCY_OPTIONS = CURRENCY_CODES.map((code) => ({
  value: code,
  label: `${CURRENCY_DETAILS[code].region} (${code})`,
}));

export const CURRENCY_SYMBOLS: Record<Currency, string> = Object.fromEntries(
  CURRENCY_CODES.map((code) => [code, CURRENCY_DETAILS[code].symbol]),
) as Record<Currency, string>;

export const CURRENCY_FULL_OPTIONS = CURRENCY_CODES.map((code) => ({
  code,
  label: `${CURRENCY_DETAILS[code].region} (${CURRENCY_DETAILS[code].unit}) ${code}`,
}));
