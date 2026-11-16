// 애플은 처음 승인할 때만 이름을 준다.
// BE 로그인이 실패하면 재시도에 다시 보낼 수 있게 성공할 때까지 메모리에 둔다.
let cached: { user: string; fullName: string } | null = null;

export function resolveAppleFullName(
  user: string,
  fromApple: string | null,
): string | null {
  if (fromApple) {
    cached = { user, fullName: fromApple };
    return fromApple;
  }
  return cached?.user === user ? cached.fullName : null;
}

export function clearAppleFullName() {
  cached = null;
}
