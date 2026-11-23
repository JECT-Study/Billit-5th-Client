import { enableTripApiMocking } from '@/mocks/tripApiMock';

/** 개발 환경에서 사용할 API 목을 한곳에서 등록한다. */
export function enableMocking() {
  enableTripApiMocking();
}
