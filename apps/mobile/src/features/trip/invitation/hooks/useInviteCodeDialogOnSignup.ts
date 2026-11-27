import {
  type NativeStackNavigationProp,
  router,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router';
import { useEffect, useState } from 'react';

const FROM_SIGNUP_VALUE = 'true';

// 신규 가입(온보딩 완료·건너뛰기) 직후 여행 목록으로 갈 때 쓰는 주소.
export const TRIPS_AFTER_SIGNUP_HREF = {
  pathname: '/trips',
  params: { fromSignup: FROM_SIGNUP_VALUE },
} as const;

export function useInviteCodeDialogOnSignup() {
  const { fromSignup } = useLocalSearchParams<{ fromSignup?: string }>();
  const isFromSignup = fromSignup === FROM_SIGNUP_VALUE;
  const rootNavigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>(
      '/',
    );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isFromSignup) return;

    return rootNavigation.addListener('transitionEnd', (event) => {
      if (!event.data.closing) setIsOpen(true);
    });
  }, [isFromSignup, rootNavigation]);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    if (isFromSignup) router.setParams({ fromSignup: undefined });
  }

  return { isOpen, open, close };
}
