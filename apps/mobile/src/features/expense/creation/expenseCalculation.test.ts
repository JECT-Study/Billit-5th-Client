import {
  calculateEqualShares,
  decimalString,
  parseDecimal,
} from './expenseCalculation';

describe('지출 금액 계산', () => {
  it('통화별 최소 단위와 소수점 범위를 검증한다', () => {
    expect(parseDecimal('12.30')).toBe(1230n);
    expect(parseDecimal('12.30', 0)).toBeNull();
    expect(parseDecimal('12.00', 0)).toBe(1200n);
    expect(parseDecimal('1.234')).toBeNull();
    expect(parseDecimal('10000000000')).toBeNull();
    expect(decimalString(1230n)).toBe('12.30');
  });

  it('자투리는 ID가 작은 참여자에게, 원화는 실제 부담액 비율로 배정한다', () => {
    const result = calculateEqualShares(1000n, 0n, 138055n, 'USD', [
      '3',
      '1',
      '2',
    ]);
    expect(result).toEqual([
      { id: '3', amount: '3.33', amountKrw: '4597' },
      { id: '1', amount: '3.34', amountKrw: '4611' },
      { id: '2', amount: '3.33', amountKrw: '4598' },
    ]);
  });

  it('JPY는 1엔 단위로 배정하고 할인이 전액이면 모두 0이다', () => {
    expect(
      calculateEqualShares(10000n, 0n, 900n, 'JPY', ['2', '1']).map(
        (item) => item.amount,
      ),
    ).toEqual(['50.00', '50.00']);
    expect(
      calculateEqualShares(100n, 100n, 100n, 'KRW', ['1', '2']).map(
        (item) => item.amountKrw,
      ),
    ).toEqual(['0', '0']);
  });
});
