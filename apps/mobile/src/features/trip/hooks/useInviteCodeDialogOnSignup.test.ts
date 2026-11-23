import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useInviteCodeDialogOnSignup } from '@/features/trip/hooks/useInviteCodeDialogOnSignup';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { setParams: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

const setIsOpen = jest.fn();

// useState에 넘긴 초기값 함수를 실행해 처음 열림 여부를 얻는다.
function getInitialIsOpen() {
  const calls = jest.mocked(useState).mock.calls as unknown[][];
  const initializer = calls[0]?.[0] as (() => boolean) | undefined;
  if (!initializer) throw new Error('useState initializer is missing');
  return initializer();
}

describe('useInviteCodeDialogOnSignup', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useState).mockReturnValue([false, setIsOpen]);
  });

  it('신규 가입 직후 들어오면 팝업을 처음부터 연다', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ fromSignup: 'true' });

    useInviteCodeDialogOnSignup();

    expect(getInitialIsOpen()).toBe(true);
  });

  it('기존 회원 로그인처럼 신호 없이 들어오면 열지 않는다', () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({});

    useInviteCodeDialogOnSignup();

    expect(getInitialIsOpen()).toBe(false);
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
