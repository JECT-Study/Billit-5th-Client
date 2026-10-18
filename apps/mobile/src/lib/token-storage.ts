import type { TokenStorage } from '@billit/api';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const storageKey = 'billit.token';

export const mobileTokenStorage: TokenStorage = {
  async getToken() {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') {
        return null;
      }
      return localStorage.getItem(storageKey);
    }
    return SecureStore.getItemAsync(storageKey);
  },
  async setToken(token) {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') {
        return;
      }
      if (token) {
        localStorage.setItem(storageKey, token);
      } else {
        localStorage.removeItem(storageKey);
      }
      return;
    }
    if (token) {
      await SecureStore.setItemAsync(storageKey, token);
    } else {
      await SecureStore.deleteItemAsync(storageKey);
    }
  },
};
