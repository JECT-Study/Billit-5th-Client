import { emailSignInSchema } from '@billit/validators';

describe('shared packages', () => {
  it('loads the shared email schema', () => {
    expect(
      emailSignInSchema.safeParse({ email: 'ada@billit.dev' }).success,
    ).toBe(true);
  });
});
