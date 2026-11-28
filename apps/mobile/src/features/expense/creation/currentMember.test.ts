import { getMemberIdFromAccessToken } from './currentMember';

describe('getMemberIdFromAccessToken', () => {
  it('액세스 토큰의 회원 ID를 읽는다', () => {
    expect(
      getMemberIdFromAccessToken('header.eyJzdWIiOiIxMjMifQ.signature'),
    ).toBe('123');
  });

  it('토큰이 없거나 형식이 잘못되면 식별하지 않는다', () => {
    expect(getMemberIdFromAccessToken(null)).toBeNull();
    expect(getMemberIdFromAccessToken('invalid')).toBeNull();
    expect(
      getMemberIdFromAccessToken('header.eyJzdWIiOiJhYmMifQ.signature'),
    ).toBeNull();
  });
});
