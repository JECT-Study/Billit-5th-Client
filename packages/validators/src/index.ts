import { z } from 'zod';

export const emailSignInSchema = z.object({
  email: z.string().email('이메일 형식이 아닙니다.'),
});

export type EmailSignInValues = z.infer<typeof emailSignInSchema>;
