import { expenseResponseSchema } from './expenseSchema';

it('지출 생성 응답에서 문자열 지출 ID를 확인한다', () => {
  expect(expenseResponseSchema.safeParse({ expenseId: '501' }).success).toBe(
    true,
  );
  expect(expenseResponseSchema.safeParse({ expenseId: 501 }).success).toBe(
    false,
  );
  expect(expenseResponseSchema.safeParse({}).success).toBe(false);
});
