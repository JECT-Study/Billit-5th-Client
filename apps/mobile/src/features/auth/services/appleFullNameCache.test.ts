import {
  clearAppleFullName,
  resolveAppleFullName,
} from '@/features/auth/services/appleFullNameCache';

describe('appleFullNameCache', () => {
  beforeEach(() => {
    clearAppleFullName();
  });

  it('애플이 이름을 주면 그 이름을 쓰고 기억한다', () => {
    expect(resolveAppleFullName('user-1', '홍길동')).toBe('홍길동');
    expect(resolveAppleFullName('user-1', null)).toBe('홍길동');
  });

  it('다른 애플 계정이면 기억해 둔 이름을 돌려주지 않는다', () => {
    resolveAppleFullName('user-1', '홍길동');

    expect(resolveAppleFullName('user-2', null)).toBeNull();
  });

  it('다른 계정이 이름을 주면 그 계정 이름으로 교체한다', () => {
    resolveAppleFullName('user-1', '홍길동');
    resolveAppleFullName('user-2', '김철수');

    expect(resolveAppleFullName('user-2', null)).toBe('김철수');
    expect(resolveAppleFullName('user-1', null)).toBeNull();
  });

  it('비우면 재시도에 이름을 보내지 않는다', () => {
    resolveAppleFullName('user-1', '홍길동');
    clearAppleFullName();

    expect(resolveAppleFullName('user-1', null)).toBeNull();
  });
});
