import { z } from 'zod';

export const referenceExchangeRateSchema = z.object({
  currency: z.enum(['JPY', 'USD', 'EUR', 'CNY']),
  rate: z.string().regex(/^\d+\.\d{2}$/),
  provider: z.string(),
  baseDate: z.iso.date(),
});

export const manualExchangeRateSchema = z.object({
  exchangeRateId: z.string(),
  rate: z.string(),
});

export type ReferenceExchangeRate = z.infer<typeof referenceExchangeRateSchema>;
export type ManualExchangeRate = z.infer<typeof manualExchangeRateSchema>;
