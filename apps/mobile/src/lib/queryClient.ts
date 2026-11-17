import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

function isClientError(error: unknown) {
  return (
    isAxiosError(error) &&
    typeof error.response?.status === 'number' &&
    error.response.status >= 400 &&
    error.response.status < 500
  );
}

// 컴포넌트 밖에서 한 번만 만든다. 가입 세션을 지울 때도 이 인스턴스를 쓴다.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (isClientError(error)) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});
