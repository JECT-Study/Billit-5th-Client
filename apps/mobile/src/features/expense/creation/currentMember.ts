// 표시용 식별자만 읽는다. 인증과 권한 검증은 서버가 담당한다.
export function getMemberIdFromAccessToken(
  token: string | null,
): string | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded: unknown = JSON.parse(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')),
    );
    if (typeof decoded !== 'object' || decoded === null || !('sub' in decoded))
      return null;
    return typeof decoded.sub === 'string' && /^\d+$/.test(decoded.sub)
      ? decoded.sub
      : null;
  } catch {
    return null;
  }
}
