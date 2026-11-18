import { View } from 'react-native';

import { SignupAgreementRow } from '@/features/auth/components/SignupAgreementRow';
import type { RegistrationTerms } from '@/features/auth/registrationInfoSchema';

type SignupAgreementListProps = {
  terms: readonly RegistrationTerms[];
  isAgeEligible: boolean;
  agreements: Record<string, boolean>;
  onToggleAgeEligible: () => void;
  onToggleTerms: (termsId: string) => void;
  onPressTermsDetail: (terms: RegistrationTerms) => void;
};

// 만 18세 확인은 약관이 아니라 서버 약관 목록과 별도로 맨 위에 둔다.
export function SignupAgreementList({
  terms,
  isAgeEligible,
  agreements,
  onToggleAgeEligible,
  onToggleTerms,
  onPressTermsDetail,
}: SignupAgreementListProps) {
  function handleToggleAgeEligible() {
    onToggleAgeEligible();
  }

  return (
    <View className="gap-18">
      <SignupAgreementRow
        label="만 18세 이상입니다."
        isRequired
        isChecked={isAgeEligible}
        onToggle={handleToggleAgeEligible}
      />
      {terms.map((item) => (
        <SignupAgreementRow
          key={item.termsId}
          label={item.title}
          isRequired={item.isRequired}
          isChecked={agreements[item.termsId] === true}
          onToggle={() => onToggleTerms(item.termsId)}
          onPressDetail={() => onPressTermsDetail(item)}
        />
      ))}
    </View>
  );
}
