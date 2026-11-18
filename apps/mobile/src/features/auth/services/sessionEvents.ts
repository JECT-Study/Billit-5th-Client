// 토큰 갱신에 실패해 세션이 끝났을 때 화면(루트 레이아웃)에 알린다
type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();

export function onSessionExpired(listener: SessionExpiredListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifySessionExpired() {
  listeners.forEach((listener) => listener());
}
