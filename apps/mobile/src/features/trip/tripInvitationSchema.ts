import { z } from 'zod';

// GET /api/v1/trips/{tripId}/invitation 응답의 data(Invitation)
export const tripInvitationSchema = z.object({
  inviteCode: z.string(),
  inviteUrl: z.string(),
});

// GET /api/v1/trip-invitations 응답의 data(InvitationSearch)
export const tripInvitationSearchSchema = z.object({
  tripId: z.string(),
  name: z.string(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  registeredMemberCount: z.number().int().nonnegative(),
  memberCapacity: z.number().int().positive(),
  status: z.enum(['UNCONFIRMED', 'CONFIRMED']),
  isAlreadyJoined: z.boolean(),
});

// POST /api/v1/trip-memberships 응답의 data(Membership)
export const tripMembershipSchema = z.object({
  tripId: z.string(),
  tripMemberId: z.string(),
});

export type TripInvitation = z.infer<typeof tripInvitationSchema>;
export type TripInvitationSearch = z.infer<typeof tripInvitationSearchSchema>;
export type TripMembership = z.infer<typeof tripMembershipSchema>;
