import { useMutation } from '@tanstack/react-query';
import { useRef, useState, type RefObject } from 'react';
import { Keyboard } from 'react-native';

import {
  deleteTripGuest,
  saveTripGuest,
} from '@/features/trip/services/tripApi';
import {
  getTripCreationTextFieldError,
  nicknameSchema,
} from '@/features/trip/shared/tripCreationSchema';
import type { Participant } from '@/features/trip/tripDetailSchema';
import { participantErrorMessage } from '@/features/trip/participants/tripParticipantError';
import { parseApiError } from '@/lib/apiError';

type Props = {
  tripId: string;
  canManage: boolean;
  isSharing: boolean;
  isConfirming: boolean;
  shareInProgress: RefObject<boolean>;
  scrollOffsetRef: RefObject<number>;
  refresh: () => Promise<void>;
  setMessage: (value: string | null) => void;
};

export function useParticipantEditor({
  tripId,
  canManage,
  isSharing,
  isConfirming,
  shareInProgress,
  scrollOffsetRef,
  refresh,
  setMessage,
}: Props) {
  const [editing, setEditing] = useState<Participant | 'new' | null>(null);
  const [nickname, setNickname] = useState('');
  const [isNicknameDuplicated, setNicknameDuplicated] = useState(false);
  const [isNicknameRequired, setNicknameRequired] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(
    null,
  );
  const nextToastId = useRef(0);
  const [isDeleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const save = useMutation({
    mutationFn: () =>
      saveTripGuest(
        tripId,
        nickname,
        editing && editing !== 'new' ? editing.tripMemberId : undefined,
      ),
    retry: false,
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteTripGuest(tripId, id),
    retry: false,
    onSuccess: refresh,
  });
  const isMutatingEditor = save.isPending || remove.isPending;
  const isBusy = isMutatingEditor || isConfirming || isSharing;
  const nicknameError = getTripCreationTextFieldError('nickname', nickname);
  function openEditor(participant: Participant | 'new') {
    if (!canManage || isBusy || shareInProgress.current) return;
    setNickname(participant === 'new' ? '' : participant.tripNickname);
    setMessage(null);
    setNicknameDuplicated(false);
    setNicknameRequired(false);
    setToast(null);
    setEditing(participant);
  }

  function handleNicknameChange(value: string) {
    setNickname(value);
    setMessage(null);
    setNicknameDuplicated(false);
    setNicknameRequired(false);
    setToast(null);
  }

  async function handleSave() {
    if (isBusy) return;
    if (nickname.length === 0) {
      setNicknameRequired(true);
      setToast({
        id: ++nextToastId.current,
        message: '필수 입력란을 채워주세요!',
      });
      return;
    }
    if (!nicknameSchema.safeParse(nickname).success) return;
    try {
      await save.mutateAsync();
      scrollOffsetRef.current = 0;
      setEditing(null);
      setMessage(null);
    } catch (error) {
      if (parseApiError(error)?.code === 'TRIP_NICKNAME_DUPLICATED') {
        setNicknameDuplicated(true);
        setToast({ id: ++nextToastId.current, message: '중복된 이름입니다.' });
        setMessage(null);
      } else {
        setMessage(participantErrorMessage(error));
      }
    }
  }

  function handleDelete() {
    if (!editing || editing === 'new' || isBusy) return;
    Keyboard.dismiss();
    setDeleteDialogVisible(true);
  }

  function handleCancelDelete() {
    setDeleteDialogVisible(false);
  }

  async function handleConfirmDelete() {
    if (!editing || editing === 'new' || isBusy) return;
    try {
      await remove.mutateAsync(editing.tripMemberId);
      scrollOffsetRef.current = 0;
      setEditing(null);
      setMessage(null);
    } catch (error) {
      setMessage(participantErrorMessage(error));
    } finally {
      setDeleteDialogVisible(false);
    }
  }

  function handleCloseEditor() {
    scrollOffsetRef.current = 0;
    setEditing(null);
    setMessage(null);
    setNicknameDuplicated(false);
    setNicknameRequired(false);
    setToast(null);
  }

  function handleDismissToast() {
    setToast(null);
  }
  return {
    editing,
    nickname,
    nicknameError,
    isNicknameDuplicated,
    isNicknameRequired,
    toast,
    isDeleteDialogVisible,
    isMutatingEditor,
    isRemoving: remove.isPending,
    openEditor,
    handleNicknameChange,
    handleSave,
    handleDelete,
    handleCancelDelete,
    handleConfirmDelete,
    handleCloseEditor,
    handleDismissToast,
  };
}
