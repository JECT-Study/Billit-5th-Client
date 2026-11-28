import { useState } from 'react';

import { useCurrentMemberId } from '@/features/expense/creation/hooks/useCurrentMemberId';
import type { Participant, TripDetail } from '@/features/trip/tripDetailSchema';

export function useExpenseParticipants(trip: TripDetail | undefined) {
  const currentMemberId = useCurrentMemberId(trip);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );
  const [pendingParticipants, setPendingParticipants] = useState<string[]>([]);
  const [isParticipantSheetOpen, setIsParticipantSheetOpen] = useState(false);
  const [isPayerSheetOpen, setIsPayerSheetOpen] = useState(false);
  const [payerId, setPayerId] = useState<string | null>(null);
  const [pendingPayerId, setPendingPayerId] = useState<string | null>(null);
  const participants = (trip?.participants ?? []).filter(
    (p) => p.participantStatus === 'MEMBER' || p.participantStatus === 'GUEST',
  );
  const currentParticipant = participants.find(
    (p) =>
      p.participantStatus === 'MEMBER' &&
      p.memberId !== null &&
      p.memberId === currentMemberId,
  );
  const effectivePayerId = payerId ?? currentParticipant?.tripMemberId ?? null;
  const selectedPayer = participants.find(
    (p) => p.tripMemberId === effectivePayerId,
  );

  function handleOpenParticipants() {
    setPendingParticipants(selectedParticipants);
    setIsParticipantSheetOpen(true);
  }
  function handleConfirmParticipants() {
    setSelectedParticipants(pendingParticipants);
    setIsParticipantSheetOpen(false);
  }
  function handleToggleParticipant(id: string) {
    setPendingParticipants((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }
  function handleOpenPayer() {
    setPendingPayerId(effectivePayerId);
    setIsPayerSheetOpen(true);
  }
  function handleConfirmPayer() {
    setPayerId(pendingPayerId);
    setIsPayerSheetOpen(false);
  }
  function participantName(participant: Participant) {
    return `${participant.tripNickname}${participant.memberId && participant.memberId === currentMemberId ? ' (나)' : ''}`;
  }
  return {
    currentMemberId,
    participants,
    selectedParticipants,
    pendingParticipants,
    effectivePayerId,
    selectedPayer,
    pendingPayerId,
    isParticipantSheetOpen,
    isPayerSheetOpen,
    handleOpenParticipants,
    handleConfirmParticipants,
    handleToggleParticipant,
    handleCloseParticipants: () => setIsParticipantSheetOpen(false),
    handleOpenPayer,
    handleConfirmPayer,
    handleSelectPayer: setPendingPayerId,
    handleClosePayer: () => setIsPayerSheetOpen(false),
    participantName,
  };
}
