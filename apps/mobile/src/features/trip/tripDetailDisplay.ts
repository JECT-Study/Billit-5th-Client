import type {
  Participant,
  ParticipantStatus,
} from '@/features/trip/tripDetailSchema';

export const LEFT_PARTICIPANT_LABEL = '나간 회원';

const STATUS_ORDER: Record<ParticipantStatus, number> = {
  MEMBER: 1,
  GUEST: 2,
  LEFT: 3,
  WITHDRAWN: 4,
};

function getParticipantOrder(participant: Participant) {
  if (participant.role === 'ADMIN') return 0;
  return STATUS_ORDER[participant.participantStatus];
}

export function sortTripParticipants(participants: readonly Participant[]) {
  return [...participants].sort(
    (a, b) => getParticipantOrder(a) - getParticipantOrder(b),
  );
}
