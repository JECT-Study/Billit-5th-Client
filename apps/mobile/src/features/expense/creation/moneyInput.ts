// 입력 중인 소수점과 0을 보존하고 정수부에만 구분자를 넣는다.
export function formatMoneyInput(value: string): string {
  const index = value.indexOf('.');
  const integer = index === -1 ? value : value.slice(0, index);
  const fraction = index === -1 ? '' : value.slice(index);
  return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + fraction;
}

export function unformatMoneyInput(value: string): string {
  return value.replace(/,/g, '');
}
