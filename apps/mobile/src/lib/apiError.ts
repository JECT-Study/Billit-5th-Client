import { isAxiosError } from 'axios';

export type FieldError = { field: string; reason: string };

export type ApiError = {
  status: number | null;
  code: string | null;
  // 사용자 표시용 메시지. 서버가 오류 코드와 함께 관리
  message: string | null;
  errors: FieldError[] | null;
};

type ErrorResponseBody = {
  code?: unknown;
  message?: unknown;
  errors?: unknown;
};

function toNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null;
}

function toFieldErrors(value: unknown): FieldError[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const fieldErrors = value.filter(
    (item): item is FieldError =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.field === 'string' &&
      typeof item.reason === 'string',
  );
  return fieldErrors.length > 0 ? fieldErrors : null;
}

// axios 요청 오류를 ApiError로 바꾼다.
export function parseApiError(error: unknown): ApiError | null {
  if (!isAxiosError<ErrorResponseBody>(error)) {
    return null;
  }

  const response = error.response;
  // JSON 본문이 아니면 본문 필드는 모두 null
  const body =
    typeof response?.data === 'object' && response.data !== null
      ? response.data
      : {};

  return {
    status: response?.status ?? null,
    code: toNonEmptyString(body.code),
    message: toNonEmptyString(body.message),
    errors: toFieldErrors(body.errors),
  };
}
