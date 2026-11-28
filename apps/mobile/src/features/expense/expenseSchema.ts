import { z } from 'zod';

// 현재 지출 생성 이후 화면에서 사용하는 응답 필드만 검증한다.
export const expenseResponseSchema = z.object({ expenseId: z.string() });

export type ExpenseResponse = z.infer<typeof expenseResponseSchema>;
