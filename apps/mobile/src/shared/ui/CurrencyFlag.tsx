import type { Currency } from '@/shared/currency';
import {
  FlagCnIcon,
  FlagEuIcon,
  FlagJpIcon,
  FlagKrIcon,
  FlagUsIcon,
} from '@/shared/ui/icons';

const CURRENCY_FLAG_ICONS = {
  KRW: FlagKrIcon,
  JPY: FlagJpIcon,
  EUR: FlagEuIcon,
  USD: FlagUsIcon,
  CNY: FlagCnIcon,
} as const;

export function CurrencyFlag({ currency }: { currency: Currency }) {
  const Icon = CURRENCY_FLAG_ICONS[currency];
  return <Icon />;
}
