import { emailSignInSchema } from './index';

describe('emailSignInSchema', () => {
  it('accepts a valid email', () => {
    expect(
      emailSignInSchema.safeParse({ email: 'ada@billit.dev' }).success,
    ).toBe(true);
  });

  it('rejects a malformed email', () => {
    const result = emailSignInSchema.safeParse({ email: 'not-an-email' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('이메일 형식이 아닙니다.');
    }
  });
});
