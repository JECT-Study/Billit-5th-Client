import type { Currency } from '@/shared/currency';

// 소수 문자열을 정수로 변환해 부동소수점 오차를 피한다.
export function parseDecimal(value: string, decimals = 2): bigint | null {
  if (!/^(0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ''] = value.split('.');
  if (decimals === 0 && /[1-9]/.test(fraction)) return null;
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
}

export function decimalString(value: bigint): string {
  return `${value / 100n}.${String(value % 100n).padStart(2, '0')}`;
}

function allocate(total: bigint, weights: bigint[], ids: string[]): bigint[] {
  const weightSum = weights.reduce((sum, value) => sum + value, 0n);
  if (weightSum === 0n) return weights.map(() => 0n);
  const shares = weights.map((weight) => (total * weight) / weightSum);
  const remaining = total - shares.reduce((sum, value) => sum + value, 0n);
  const order = weights
    .map((weight, index) => ({
      index,
      remainder: (total * weight) % weightSum,
      id: ids[index],
    }))
    .sort((a, b) => {
      if (a.remainder !== b.remainder)
        return a.remainder > b.remainder ? -1 : 1;
      if (/^\d+$/.test(a.id) && /^\d+$/.test(b.id))
        return BigInt(a.id) < BigInt(b.id)
          ? -1
          : BigInt(a.id) > BigInt(b.id)
            ? 1
            : 0;
      return a.id.localeCompare(b.id);
    });
  for (let i = 0; i < Number(remaining); i += 1) shares[order[i].index] += 1n;
  return shares;
}

export function calculateEqualShares(
  original: bigint,
  discount: bigint,
  rate: bigint,
  currency: Currency,
  ids: string[],
) {
  const factor = currency === 'KRW' || currency === 'JPY' ? 100n : 1n;
  const total = (original - discount) / factor;
  const amountKrw = ((original - discount) * rate + 5000n) / 10000n;
  const shares = allocate(
    total,
    ids.map(() => (original === 0n ? 0n : 1n)),
    ids,
  );
  const krwShares = allocate(amountKrw, shares, ids);
  return ids.map((id, index) => ({
    id,
    amount: decimalString(shares[index] * factor),
    amountKrw: krwShares[index].toString(),
  }));
}
