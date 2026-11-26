import {
  isInviteCodeValid,
  normalizeInviteCode,
} from '@/features/trip/invitation/inviteCode';

describe('normalizeInviteCode', () => {
  it('앞뒤와 중간의 공백을 지우고 대문자로 바꾼다', () => {
    expect(normalizeInviteCode(' a7k 2pq ')).toBe('A7K2PQ');
    expect(normalizeInviteCode('a7k\t2pq\n')).toBe('A7K2PQ');
  });

  it('빈 입력은 빈 문자열로 둔다', () => {
    expect(normalizeInviteCode('   ')).toBe('');
  });
});

describe('isInviteCodeValid', () => {
  it('영문 대문자와 숫자로 된 6자리만 허용한다', () => {
    expect(isInviteCodeValid('A7K2PQ')).toBe(true);
    expect(isInviteCodeValid('123456')).toBe(true);
  });

  it('길이가 다르거나 소문자·특수문자가 있으면 거절한다', () => {
    expect(isInviteCodeValid('A7K2P')).toBe(false);
    expect(isInviteCodeValid('A7K2PQR')).toBe(false);
    expect(isInviteCodeValid('a7k2pq')).toBe(false);
    expect(isInviteCodeValid('A7K-PQ')).toBe(false);
    expect(isInviteCodeValid('')).toBe(false);
  });
});
