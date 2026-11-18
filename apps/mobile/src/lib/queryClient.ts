import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

const RETRYABLE_STATUS = new Set([502, 503, 504]);

function isRetryableError(error: unknown) {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === undefined || RETRYABLE_STATUS.has(status);
}

// 컴포넌트 밖에서 한 번만 만든다. 가입 세션을 지울 때도 이 인스턴스를 쓴다.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        isRetryableError(error) && failureCount < 3,
    },
  },
});
