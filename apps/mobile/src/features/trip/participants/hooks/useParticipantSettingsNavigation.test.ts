import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { router, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';

import { useParticipantSettingsNavigation } from '@/features/trip/participants/hooks/useParticipantSettingsNavigation';
import { tripKeys } from '@/features/trip/tripKeys';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: jest.fn((callback) => callback),
  useEffect: jest.fn(),
  useRef: jest.fn((value) => ({ current: value })),
  useState: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({ useQueryClient: jest.fn() }));
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useNavigation: jest.fn(),
}));
jest.mock('@/features/trip/services/tripApi', () => ({ getTrip: jest.fn() }));

const setOpeningSettings = jest.fn();
const fetchQuery = jest.fn();
const onClose = jest.fn();
const prepareRestore = jest.fn();
const listeners: Record<
  string,
  (event?: { data: { closing: boolean } }) => void
> = {};
const addListener = jest.fn(
  (
    event: string,
    callback: (event?: { data: { closing: boolean } }) => void,
  ) => {
    listeners[event] = callback;
    return jest.fn();
  },
);

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

function useStartNavigation() {
  const result = useParticipantSettingsNavigation('trip-1', onClose, {
    current: prepareRestore,
  });
  for (const [effect] of jest.mocked(useEffect).mock.calls) effect();
  result.openSettings();
  result.handleSettingsSheetDismissed();
  return result;
}

describe('참여 현황에서 여행방 설정으로 이동', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete listeners.focus;
    delete listeners.blur;
    delete listeners.transitionEnd;
    jest.mocked(useState).mockReturnValue([false, setOpeningSettings]);
    jest.mocked(useNavigation).mockReturnValue({ addListener } as never);
    jest.mocked(useQueryClient).mockReturnValue({ fetchQuery } as never);
    jest.spyOn(InteractionManager, 'runAfterInteractions').mockImplementation(((
      task: () => void,
    ) => {
      task();
      return { cancel: jest.fn() };
    }) as never);
  });

  afterEach(() => jest.restoreAllMocks());

  it('설정에서 돌아오면 최신 여행 정보를 조회하고 시트를 다시 연다', async () => {
    fetchQuery.mockResolvedValue({ tripId: 'trip-1' });
    useStartNavigation();
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/trips/[tripId]/settings',
      params: { tripId: 'trip-1' },
    });
    expect(onClose).not.toHaveBeenCalled();

    listeners.blur?.();
    listeners.focus?.();
    await flushPromises();

    expect(fetchQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: tripKeys.detail('trip-1') }),
    );
    expect(setOpeningSettings).not.toHaveBeenCalledWith(false);
    listeners.transitionEnd?.({ data: { closing: true } });
    expect(prepareRestore).toHaveBeenCalledTimes(1);
    expect(setOpeningSettings).toHaveBeenLastCalledWith(false);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('설정에서 여행이 삭제됐다면 시트를 다시 열지 않고 닫는다', async () => {
    fetchQuery.mockRejectedValue(
      new AxiosError('not found', undefined, undefined, undefined, {
        status: 404,
        data: {},
      } as never),
    );
    useStartNavigation();
    listeners.blur?.();
    listeners.focus?.();
    listeners.transitionEnd?.({ data: { closing: true } });
    await flushPromises();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(setOpeningSettings).not.toHaveBeenCalledWith(false);
    expect(prepareRestore).not.toHaveBeenCalled();
  });

  it('설정 화면으로 떠나기 전 포커스 이벤트에는 복원하지 않는다', () => {
    useStartNavigation();
    listeners.focus?.();
    expect(fetchQuery).not.toHaveBeenCalled();
  });

  it('일시적인 조회 오류에는 시트를 다시 열어 기존 데이터를 보여준다', async () => {
    fetchQuery.mockRejectedValue(new Error('network'));
    useStartNavigation();
    listeners.blur?.();
    listeners.transitionEnd?.({ data: { closing: true } });
    listeners.focus?.();
    await flushPromises();

    expect(setOpeningSettings).toHaveBeenLastCalledWith(false);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('설정으로 이동하는 전환 종료는 복귀 완료로 취급하지 않는다', async () => {
    fetchQuery.mockResolvedValue({ tripId: 'trip-1' });
    useStartNavigation();
    listeners.blur?.();
    listeners.transitionEnd?.({ data: { closing: false } });
    listeners.focus?.();
    await flushPromises();
    expect(setOpeningSettings).not.toHaveBeenCalledWith(false);
  });
});
