const inviteCodePattern = /^[A-Z0-9]{6}$/;

/** 입력한 초대 코드에서 공백을 모두 지우고 대문자로 바꾼다. " ab c12 " → "ABC12" */
export function normalizeInviteCode(input: string) {
  return input.replace(/\s/g, '').toUpperCase();
}

/** 영문 대문자와 숫자로 된 6자리 초대 코드인지 확인한다. 정규화한 값을 넘긴다. */
export function isInviteCodeValid(code: string) {
  return inviteCodePattern.test(code);
}
