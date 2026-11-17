export class RegistrationTokenExpiredError extends Error {
  constructor() {
    super('가입 시간이 만료됐어요');
    this.name = 'RegistrationTokenExpiredError';
  }
}
