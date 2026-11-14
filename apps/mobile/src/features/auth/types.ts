export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

// POST /api/v1/auth/social-logins 응답 data
export type SocialLoginResult =
  | ({ status: 'AUTHENTICATED' } & AuthTokens)
  | { status: 'REGISTRATION_REQUIRED'; registrationToken: string };
