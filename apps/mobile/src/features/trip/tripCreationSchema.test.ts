import { INITIAL_TRIP_DRAFT, type TripCreationDraft } from './tripCreationForm';
import {
  getTripCreationTextFieldError,
  getTripDateRangeError,
  isTripStepInputEmpty,
  tripCreationSchema,
  validateTripCreationStep,
} from './tripCreationSchema';

const completeDraft: TripCreationDraft = {
  ...INITIAL_TRIP_DRAFT,
  name: '도쿄 여행',
  countryCode: 'JP',
  baseCurrency: 'JPY',
  startDate: '2026-11-19',
  endDate: '2026-11-19',
  memberCapacity: 1,
  nickname: '민지',
};

describe('validateTripCreationStep', () => {
  it('단계별 필수 입력을 확인하고 당일 여행과 1인 여행을 허용한다', () => {
    expect(validateTripCreationStep(INITIAL_TRIP_DRAFT, 0)).toContain('여행명');
    expect(
      validateTripCreationStep({ ...completeDraft, countryCode: null }, 1),
    ).toContain('국가');
    expect(
      validateTripCreationStep({ ...completeDraft, endDate: '' }, 3),
    ).toContain('기간');
    expect(validateTripCreationStep(completeDraft, 4)).toBeNull();
    expect(validateTripCreationStep(completeDraft, 5)).toBeNull();
  });

  it('기타 국가명, 여행명, 기간과 총인원 제한을 적용한다', () => {
    expect(
      validateTripCreationStep({ ...completeDraft, name: '서울@' }, 0),
    ).toContain('여행명');
    expect(
      validateTripCreationStep(
        { ...completeDraft, name: '여행여행여행여행여행여행여행여행' },
        0,
      ),
    ).toContain('여행명');
    expect(
      validateTripCreationStep(
        {
          ...completeDraft,
          countryCode: 'ETC',
          customCountryName: '뉴 질랜드',
        },
        1,
      ),
    ).toContain('국가명');
    expect(
      validateTripCreationStep({ ...completeDraft, endDate: '2026-11-18' }, 3),
    ).toContain('종료일');
    expect(
      validateTripCreationStep({ ...completeDraft, memberCapacity: 11 }, 4),
    ).toContain('총인원');
    expect(
      validateTripCreationStep({ ...completeDraft, nickname: '민 지@' }, 5),
    ).toBe('공백 또는 특수문자는 포함할 수 없어요.');
  });
});

describe('isTripStepInputEmpty', () => {
  it('단계별로 아직 채우지 않은 입력을 구분한다', () => {
    expect(isTripStepInputEmpty(INITIAL_TRIP_DRAFT, 0)).toBe(true);
    expect(isTripStepInputEmpty(completeDraft, 0)).toBe(false);
    expect(isTripStepInputEmpty(INITIAL_TRIP_DRAFT, 1)).toBe(true);
    expect(
      isTripStepInputEmpty({ ...completeDraft, countryCode: 'ETC' }, 1),
    ).toBe(true);
    expect(isTripStepInputEmpty(INITIAL_TRIP_DRAFT, 2)).toBe(false);
    expect(isTripStepInputEmpty({ ...completeDraft, endDate: '' }, 3)).toBe(
      true,
    );
    expect(
      isTripStepInputEmpty({ ...completeDraft, memberCapacity: null }, 4),
    ).toBe(true);
    expect(isTripStepInputEmpty({ ...completeDraft, nickname: '' }, 5)).toBe(
      true,
    );
    expect(
      isTripStepInputEmpty({ ...completeDraft, nickname: '민 지' }, 5),
    ).toBe(false);
  });
});

describe('tripCreationSchema', () => {
  it('최종 제출 시 단계별 규칙을 모두 적용하고 정리된 여행명을 반환한다', () => {
    const result = tripCreationSchema.safeParse({
      ...completeDraft,
      name: ' 도쿄 여행 ',
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('도쿄 여행');
  });

  it('필드 오류 메시지와 날짜 순서를 확인한다', () => {
    expect(getTripCreationTextFieldError('name', '서울@')).toContain('여행명');
    expect(getTripCreationTextFieldError('nickname', '민 지')).toBe(
      '공백 또는 특수문자는 포함할 수 없어요.',
    );
    expect(getTripCreationTextFieldError('nickname', '민지@')).toBe(
      '공백 또는 특수문자는 포함할 수 없어요.',
    );
    expect(getTripCreationTextFieldError('nickname', 'Jiho12')).toBeUndefined();
    expect(getTripCreationTextFieldError('nickname', '')).toBeUndefined();
    expect(getTripCreationTextFieldError('name', '  ')).toBeUndefined();
    expect(getTripDateRangeError('2026-11-19', '2026-11-18')).toBe(
      '종료일은 시작일 이후로 선택해주세요.',
    );
    expect(getTripDateRangeError('2026-11-19', '2026-11-19')).toBeUndefined();
    expect(
      tripCreationSchema.safeParse({
        ...completeDraft,
        endDate: '2026-11-18',
      }).success,
    ).toBe(false);
  });
});
