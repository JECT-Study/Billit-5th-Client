import { z } from 'zod';

import { tripSummarySchema } from '@/features/trip/tripSummarySchema';

// MEMBER: 로그인 참여자, GUEST: 비로그인 참여자, LEFT: 나간 회원, WITHDRAWN: 탈퇴 회원
export const participantStatusSchema = z.enum([
  'MEMBER',
  'GUEST',
  'LEFT',
  'WITHDRAWN',
]);

export const participantSchema = z.object({
  tripMemberId: z.string(),
  memberId: z.string().nullable(),
  tripNickname: z.string(),
  role: z.enum(['ADMIN', 'MEMBER']),
  participantStatus: participantStatusSchema,
  shareAmountKrw: z.string().regex(/^-?(0|[1-9]\d*)\.\d{2}$/),
});

export const tripDetailSchema = tripSummarySchema.extend({
  participants: z.array(participantSchema),
});

export type ParticipantStatus = z.infer<typeof participantStatusSchema>;
export type Participant = z.infer<typeof participantSchema>;
export type TripDetail = z.infer<typeof tripDetailSchema>;
