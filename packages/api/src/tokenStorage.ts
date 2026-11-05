export type TokenStorage = {
  getToken: () => Promise<string | null>;
  setToken: (token: string | null) => Promise<void>;
};
