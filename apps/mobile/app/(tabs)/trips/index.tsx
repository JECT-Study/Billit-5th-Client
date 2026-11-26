import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { TripScreen } from '@/features/trip';
import { TripParticipantSheet } from '@/features/trip/participants/components/TripParticipantSheet';

export default function TripRoute() {
  const { openTripId } = useLocalSearchParams<{ openTripId?: string }>();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const participantTripId = openTripId ?? selectedTripId;

  function handleCloseParticipantSheet() {
    if (openTripId) router.setParams({ openTripId: undefined });
    setSelectedTripId(null);
  }

  function handleOpenParticipantSheet(tripId: string) {
    setSelectedTripId(tripId);
  }

  return (
    <>
      <TripScreen onOpenParticipantSheet={handleOpenParticipantSheet} />
      {participantTripId ? (
        <TripParticipantSheet
          tripId={participantTripId}
          onClose={handleCloseParticipantSheet}
        />
      ) : null}
    </>
  );
}
