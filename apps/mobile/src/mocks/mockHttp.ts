import {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

const statusTexts: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
};

export function toResponse<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
): AxiosResponse<T> {
  return {
    config,
    data,
    headers: {},
    request: {},
    status,
    statusText: statusTexts[status] ?? 'OK',
  };
}

// 커스텀 adapter의 반환값은 상태 코드와 관계없이 성공으로 처리되므로 오류는 직접 던진다.
export function toApiError(
  config: InternalAxiosRequestConfig,
  status: number,
  code: string,
  message: string,
) {
  return new AxiosError(
    message,
    AxiosError.ERR_BAD_REQUEST,
    config,
    {},
    {
      config,
      data: { code, message },
      headers: {},
      status,
      statusText: '',
    },
  );
}

// 응답 없이 실패한 요청(네트워크 끊김)과 같은 모양의 오류
export function toNetworkError(config: InternalAxiosRequestConfig) {
  return new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, {});
}

// axios는 JSON 본문을 문자열로 직렬화해 adapter에 넘긴다.
export function parseRequestBody<T>(data: unknown): T {
  return typeof data === 'string' ? (JSON.parse(data) as T) : (data as T);
}
