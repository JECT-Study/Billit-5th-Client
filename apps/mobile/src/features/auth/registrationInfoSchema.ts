import { z } from 'zod';

export const registrationTermsSchema = z.object({
  termsId: z.string(),
  title: z.string(),
  isRequired: z.boolean(),
  contentUrl: z.string(),
});

// GET /api/v1/me/registration 응답 data
export const registrationInfoSchema = z.object({
  status: z.literal('SIGNING_UP'),
  socialDisplayName: z.string().nullable(),
  terms: z.array(registrationTermsSchema),
});

export type RegistrationTerms = z.infer<typeof registrationTermsSchema>;
export type RegistrationInfo = z.infer<typeof registrationInfoSchema>;
