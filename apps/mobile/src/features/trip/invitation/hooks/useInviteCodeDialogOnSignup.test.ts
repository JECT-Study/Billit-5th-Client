import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';

import { useInviteCodeDialogOnSignup } from '@/features/trip/invitation/hooks/useInviteCodeDialogOnSignup';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { setParams: jest.fn() },
  useLocalSearchParams: jest.fn(),
  useNavigation: jest.fn(),
}));

type TransitionEndListener = (event: { data: { closing: boolean } }) => void;

const setIsOpen = jest.fn();
const unsubscribe = jest.fn();
const addListener = jest.fn();

// useEffect에 넘긴 함수를 실행하고 정리 함수를 돌려준다.
function runEffect() {
  const effect = jest.mocked(useEffect).mock.calls[0]?.[0];
  if (!effect) throw new Error('useEffect is missing');
  return effect();
}

// 루트 Stack에 등록한 전환 종료 리스너를 꺼낸다.
function getTransitionEndListener() {
  const call = addListener.mock.calls[0] as
    [string, TransitionEndListener] | undefined;
  if (!call) throw new Error('transitionEnd listener is missing');
  expect(call[0]).toBe('transitionEnd');
  return call[1];
}

describe('useInviteCodeDialogOnSignup', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useState).mockReturnValue([false, setIsOpen]);
    addListener.mockReturnValue(unsubscribe);
    jest.mocked(useNavigation).mockReturnValue({ addListener });
  });

  it('처음에는 팝업을 닫힌 상태로 둔다', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ fromSignup: 'true' });

    useInviteCodeDialogOnSignup();

    expect(useState).toHaveBeenCalledWith(false);
  });

  it('신규 가입 직후 들어오면 탭 화면으로의 전환이 끝난 뒤 팝업을 연다', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ fromSignup: 'true' });

    useInviteCodeDialogOnSignup();
    runEffect();

    expect(useNavigation).toHaveBeenCalledWith('/');
    expect(setIsOpen).not.toHaveBeenCalled();

    getTransitionEndListener()({ data: { closing: false } });

    expect(setIsOpen).toHaveBeenCalledWith(true);
  });

  it('탭 화면이 가려지는 전환이 끝날 때는 팝업을 열지 않는다', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ fromSignup: 'true' });

    useInviteCodeDialogOnSignup();
    runEffect();
    getTransitionEndListener()({ data: { closing: true } });

    expect(setIsOpen).not.toHaveBeenCalled();
  });

  it('화면을 떠나면 전환 종료 리스너를 해제한다', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ fromSignup: 'true' });

    useInviteCodeDialogOnSignup();
    const cleanup = runEffect();
    if (typeof cleanup === 'function') cleanup();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('기존 회원 로그인처럼 신호 없이 들어오면 전환을 기다리지 않는다', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({});

    useInviteCodeDialogOnSignup();
    runEffect();

    expect(addListener).not.toHaveBeenCalled();
    expect(setIsOpen).not.toHaveBeenCalled();
  });

  it('신규 가입으로 열린 팝업을 닫으면 다시 열리지 않게 신호를 지운다', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ fromSignup: 'true' });

    useInviteCodeDialogOnSignup().close();

    expect(setIsOpen).toHaveBeenCalledWith(false);
    expect(router.setParams).toHaveBeenCalledWith({ fromSignup: undefined });
  });

  it('직접 연 팝업을 닫을 때는 주소를 건드리지 않는다', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({});

    const dialog = useInviteCodeDialogOnSignup();
    dialog.open();
    dialog.close();

    expect(setIsOpen).toHaveBeenNthCalledWith(1, true);
    expect(setIsOpen).toHaveBeenNthCalledWith(2, false);
    expect(router.setParams).not.toHaveBeenCalled();
  });
});
