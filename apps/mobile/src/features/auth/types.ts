export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

// POST /api/v1/auth/social-logins 응답 data
export type SocialLoginResult =
  | ({ status: 'AUTHENTICATED' } & AuthTokens)
  | { status: 'REGISTRATION_REQUIRED'; registrationToken: string };

// POST /api/v1/me/registration 요청
// survey는 선택사항으로 둔다. 추후 논의 후 survey를 registration 과정에서 제외시킬 지 결정
export type CompleteRegistrationRequest = {
  platform: 'IOS' | 'ANDROID';
  appVersion: string;
  isAgeEligible: true;
  agreements: {
    termsId: string;
    isAgreed: boolean;
  }[];
  survey?: {
    gender?: string;
    isTripOrganizer?: boolean;
    settlementPainPoints?: string[];
    otherSettlementPainPoint?: string;
  };
};
