import { z } from 'zod';

import {
  TRIP_COUNTRY_CODES,
  TRIP_CURRENCY_CODES,
} from '@/features/trip/tripCreationForm';
import type {
  TripCreationDraft,
  TripCreationStep,
} from '@/features/trip/tripCreationForm';

const nameMessage = '여행명은 한글, 영문, 숫자와 공백으로 1~15자 입력해주세요.';
const countryNameMessage = '국가명은 한글 또는 영문으로 1~10자 입력해주세요.';
const nicknameMessage = '공백 또는 특수문자는 포함할 수 없어요.';
const memberCapacityMessage =
  '총인원은 생성자를 포함해 1~10명으로 선택해주세요.';
const dateMessage = '여행 기간을 선택해주세요.';
const dateOrderMessage = '종료일은 시작일 이후로 선택해주세요.';

const nameSchema = z
  .string()
  .trim()
  .regex(
    /^[가-힣A-Za-z0-9](?:[가-힣A-Za-z0-9 ]{0,13}[가-힣A-Za-z0-9])?$/,
    nameMessage,
  );

const customCountryNameSchema = z
  .string()
  .trim()
  .regex(/^[가-힣A-Za-z]{1,10}$/, countryNameMessage);

// 여행 생성과 초대 코드 참여에서 같은 여행방 닉네임 규칙을 쓴다.
export const nicknameSchema = z
  .string()
  .regex(/^[가-힣A-Za-z0-9]{1,10}$/, nicknameMessage);

export const nameStepSchema = z.object({ name: nameSchema });

export const countryStepSchema = z
  .object({
    countryCode: z.enum(TRIP_COUNTRY_CODES, {
      error: '여행 국가를 선택해주세요.',
    }),
    customCountryName: z.string(),
  })
  .refine(
    ({ countryCode, customCountryName }) =>
      countryCode !== 'ETC' ||
      customCountryNameSchema.safeParse(customCountryName).success,
    { message: countryNameMessage, path: ['customCountryName'] },
  );

export const currencyStepSchema = z.object({
  baseCurrency: z.enum(TRIP_CURRENCY_CODES),
});

export const dateStepSchema = z
  .object({
    startDate: z.iso.date({ error: dateMessage }),
    endDate: z.iso.date({ error: dateMessage }),
  })
  .refine(({ startDate, endDate }) => endDate >= startDate, {
    message: dateOrderMessage,
    path: ['endDate'],
  });

const memberStepSchema = z.object({
  memberCapacity: z
    .number({ error: memberCapacityMessage })
    .int(memberCapacityMessage)
    .min(1, memberCapacityMessage)
    .max(10, memberCapacityMessage),
});

const nicknameStepSchema = z.object({ nickname: nicknameSchema });

const stepSchemas = [
  nameStepSchema,
  countryStepSchema,
  currencyStepSchema,
  dateStepSchema,
  memberStepSchema,
  nicknameStepSchema,
] as const;

// 각 단계의 입력 규칙을 최종 제출에도 그대로 적용한다.
export const tripCreationSchema = nameStepSchema
  .and(countryStepSchema)
  .and(currencyStepSchema)
  .and(dateStepSchema)
  .and(memberStepSchema)
  .and(nicknameStepSchema);

export type TripCreationValues = z.infer<typeof tripCreationSchema>;

export function validateTripCreationStep(
  draft: TripCreationDraft,
  step: TripCreationStep,
): string | null {
  for (const schema of stepSchemas.slice(0, step + 1)) {
    const result = schema.safeParse(draft);
    if (!result.success) return result.error.issues[0]?.message ?? null;
  }
  return null;
}

export function getTripCreationTextFieldError(
  field: 'name' | 'nickname',
  value: string,
): string | undefined {
  if (value.length === 0 || (field === 'name' && value.trim() === '')) {
    return undefined;
  }
  const result = (field === 'name' ? nameSchema : nicknameSchema).safeParse(
    value,
  );
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function getTripDateRangeError(
  startDate: string,
  endDate: string,
): string | undefined {
  if (!startDate || !endDate) return undefined;
  const result = dateStepSchema.safeParse({ startDate, endDate });
  return result.success ? undefined : result.error.issues[0]?.message;
}

// 빈 입력은 형식 오류 대신 필수 입력 안내를 보여준다
export function isTripStepInputEmpty(
  draft: TripCreationDraft,
  step: TripCreationStep,
) {
  switch (step) {
    case 0:
      return draft.name.trim() === '';
    case 1:
      return (
        !draft.countryCode ||
        (draft.countryCode === 'ETC' && draft.customCountryName.trim() === '')
      );
    case 2:
      return false;
    case 3:
      return !draft.startDate || !draft.endDate;
    case 4:
      return draft.memberCapacity === null;
    case 5:
      return draft.nickname === '';
  }
}
