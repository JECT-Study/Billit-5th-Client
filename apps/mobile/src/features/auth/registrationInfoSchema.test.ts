import { registrationInfoSchema } from '@/features/auth/registrationInfoSchema';

describe('registrationInfoSchema', () => {
  it('약관 주소가 URL 형식이 아니어도 응답을 통과시킨다', () => {
    const result = registrationInfoSchema.safeParse({
      status: 'SIGNING_UP',
      terms: [
        {
          termsId: '1',
          title: '개인정보 수집 및 이용 동의',
          isRequired: true,
          contentUrl: 'terms/privacy',
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
