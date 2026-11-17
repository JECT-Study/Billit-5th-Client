import type { TokenStorage } from '@billit/api';

// 서버 유효 시간 30분보다 1분 짧게 본다. 만료 직전에 요청이 나가지 않게 한다.
const REGISTRATION_TOKEN_TTL_MS = 29 * 60 * 1000;

let token: string | null = null;
let issuedAt: number | null = null;

function clearRegistrationToken() {
  token = null;
  issuedAt = null;
}

// 앱을 다시 켜면 메모리와 함께 사라진다. QueryClient는 여기서 다루지 않는다.
export const registrationTokenStorage: TokenStorage = {
  async getToken() {
    if (token === null || issuedAt === null) {
      clearRegistrationToken();
      return null;
    }
    if (Date.now() - issuedAt >= REGISTRATION_TOKEN_TTL_MS) {
      clearRegistrationToken();
      return null;
    }
    return token;
  },
  // await 없이 호출돼도 반환 전에 메모리 저장이 끝나야 한다.
  async setToken(nextToken) {
    if (nextToken === null) {
      clearRegistrationToken();
      return;
    }
    token = nextToken;
    issuedAt = Date.now();
  },
};
