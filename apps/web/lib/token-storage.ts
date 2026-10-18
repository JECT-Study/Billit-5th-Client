import type { TokenStorage } from '@billit/api';

const storageKey = 'billit.token';

export const webTokenStorage: TokenStorage = {
  async getToken() {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.localStorage.getItem(storageKey);
  },
  async setToken(token) {
    if (typeof window === 'undefined') {
      return;
    }
    if (token) {
      window.localStorage.setItem(storageKey, token);
    } else {
      window.localStorage.removeItem(storageKey);
    }
  },
};
