import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { useSearchTripInvitationMutation } from '@/features/trip/hooks/useSearchTripInvitationMutation';
import {
  isInviteCodeValid,
  normalizeInviteCode,
} from '@/features/trip/inviteCode';
import {
  formatTripMemberLimit,
  getInviteCodeSearchStatus,
} from '@/features/trip/inviteCodeSearchResult';
import type { TripInvitationSearch } from '@/features/trip/tripInvitationSchema';
import { formatTripDateRange } from '@/features/trip/tripListDisplay';
import { parseApiError } from '@/lib/apiError';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { SearchIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { COLORS, FONT_SIZE, TEXT_COLORS } from '@/theme/theme.generated';

// TODO: Figma의 error_bg가 토큰 내보내기 대상이 아닌 "변수 컬렉션"에 있어 tokens.json에 없다.
// Figma에서 BILLIT · Color / Primitive v2로 옮기면 토큰을 다시 추출(pnpm tokens:build)하고 이 상수를 토큰으로 바꾼다.
const UNAVAILABLE_CARD_BACKGROUND = '#FFE7E8';
const NOT_FOUND_MESSAGE = '검색 결과가 없어요.';
const SEARCH_FAILED_MESSAGE = '검색하지 못했어요. 다시 시도해주세요.';

// input: 코드 입력 (2260:19074) → result: 검색 결과 (2260:19158 참여 가능, 2260:19250 참여불가)
type DialogStep = 'input' | 'result';

type InviteCodeDialogProps = {
  onClose: () => void;
};

// 닫히면 언마운트되어 입력과 검색 결과가 초기화된다.
export function InviteCodeDialog({ onClose }: InviteCodeDialogProps) {
  const searchMutation = useSearchTripInvitationMutation();
  const [step, setStep] = useState<DialogStep>('input');
  const [input, setInput] = useState('');
  // 형식이 틀린 코드는 서버에 보내지 않고 바로 결과 없음으로 보여준다.
  const [isFormatInvalid, setIsFormatInvalid] = useState(false);

  const result = searchMutation.data;
  const status = result ? getInviteCodeSearchStatus(result) : null;
  const isNotFound =
    isFormatInvalid || parseApiError(searchMutation.error)?.status === 404;
  const searchMessage = isNotFound
    ? NOT_FOUND_MESSAGE
    : searchMutation.isError
      ? SEARCH_FAILED_MESSAGE
      : null;
  const isInputEmpty = input.trim() === '';
  const isJoinDisabled =
    status !== 'JOINABLE' || isInputEmpty || searchMutation.isPending;

  function handleChangeText(text: string) {
    setInput(text);
    // 입력이 바뀌면 이전 검색 결과와 안내 문구를 지운다. 결과 단계는 유지한다.
    setIsFormatInvalid(false);
    searchMutation.reset();
  }

  function handleSearch() {
    const code = normalizeInviteCode(input);
    if (code === '' || searchMutation.isPending) return;
    // 없는 코드와 검색 실패도 검색 결과 단계(3037:54953)로 넘어가 결과 영역에 안내를 보여준다.
    if (!isInviteCodeValid(code)) {
      setIsFormatInvalid(true);
      setStep('result');
      return;
    }
    searchMutation.mutate(code, {
      onSuccess: (searched) => {
        if (getInviteCodeSearchStatus(searched) === 'ALREADY_JOINED') {
          // 여행 목록 위에서 열린 팝업이라 닫기만 하면 목록이 보인다.
          // TODO: 여행방 상세 화면이 생기면 해당 여행방으로 이동
          onClose();
          return;
        }
        setStep('result');
      },
      onError: () => {
        setStep('result');
      },
    });
  }

  function handleClose() {
    onClose();
  }

  function handleJoin() {
    // 입력창의 현재 값이 아니라 검색에 쓴 코드를 넘긴다.
    const inviteCode = searchMutation.variables;
    if (!inviteCode) return;
    onClose();
    router.push({ pathname: '/trips/join', params: { inviteCode } });
  }

  if (step === 'input') {
    return (
      <Dialog visible title="초대 코드" onClose={handleClose}>
        <Text className="text-secondary text-body-2 mt-10 text-center font-semibold">
          {
            '전달 받은 초대코드를 입력해주세요.\n오픈하기 전 여행방에만 참여할 수 있어요.'
          }
        </Text>
        <View className="mt-30 mx-12">
          <InviteCodeInput
            value={input}
            onChangeText={handleChangeText}
            onSubmit={handleSearch}
          />
        </View>
        <Button
          label="여행방 검색하기"
          onPress={handleSearch}
          isDisabled={isInputEmpty || searchMutation.isPending}
          className="mt-30"
        />
      </Dialog>
    );
  }

  return (
    <Dialog visible title="검색 결과" onClose={handleClose}>
      <View className="mt-24">
        <InviteCodeInput
          value={input}
          onChangeText={handleChangeText}
          onSubmit={handleSearch}
          isSearchDisabled={searchMutation.isPending}
        />
      </View>
      {/* 시안의 팝업 높이(423)를 유지하도록 결과 영역 높이를 고정한다. */}
      <View className="pt-18 h-[204px]">
        {result && status !== 'ALREADY_JOINED' ? (
          <InviteCodeResultCard
            result={result}
            isJoinable={status === 'JOINABLE'}
          />
        ) : searchMessage ? (
          // 결과 카드 대신 빈 결과 영역의 가운데에 조금 크게 보여준다.
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted text-label-1 text-center font-medium">
              {searchMessage}
            </Text>
          </View>
        ) : null}
      </View>
      <Button
        label="이 여행 참여하기"
        variant="black"
        onPress={handleJoin}
        isDisabled={isJoinDisabled}
      />
    </Dialog>
  );
}

type InviteCodeInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  // 넘기면 결과 단계처럼 오른쪽에 검색 버튼을 보여준다.
  isSearchDisabled?: boolean;
};

function InviteCodeInput({
  value,
  onChangeText,
  onSubmit,
  isSearchDisabled,
}: InviteCodeInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasSearchButton = isSearchDisabled !== undefined;

  function handleChangeText(text: string) {
    onChangeText(text);
  }

  function handleSubmit() {
    onSubmit();
  }

  function handleFocus() {
    setIsFocused(true);
  }

  function handleBlur() {
    setIsFocused(false);
  }

  return (
    <View
      className="rounded-12 px-18 h-48 flex-row items-center gap-8 border"
      style={{ borderColor: isFocused ? COLORS['sky-30'] : COLORS['gray-2'] }}
    >
      <TextInput
        accessibilityLabel="초대 코드"
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={handleSubmit}
        placeholder="참여코드를 검색해주세요"
        placeholderTextColor={COLORS['gray-6']}
        autoCapitalize="characters"
        autoCorrect={false}
        returnKeyType="search"
        autoFocus
        underlineColorAndroid="transparent"
        selectionColor={COLORS['sky-60']}
        className="text-strong flex-1 font-medium"
        style={{
          fontSize: FONT_SIZE['body-2'][0],
          letterSpacing: FONT_SIZE['body-2'][1].letterSpacing,
          height: 28,
          padding: 0,
          margin: 0,
          includeFontPadding: false,
          textAlignVertical: 'center',
        }}
      />
      {hasSearchButton ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="초대 코드 검색"
          accessibilityState={{ disabled: isSearchDisabled }}
          disabled={isSearchDisabled}
          hitSlop={8}
          onPress={handleSubmit}
        >
          <SearchIcon color={TEXT_COLORS.placeholder} />
        </Pressable>
      ) : null}
    </View>
  );
}

type InviteCodeResultCardProps = {
  result: TripInvitationSearch;
  isJoinable: boolean;
};

function InviteCodeResultCard({
  result,
  isJoinable,
}: InviteCodeResultCardProps) {
  return (
    <View
      className={`rounded-12 px-18 gap-[3px] py-10 ${isJoinable ? 'bg-sky-10' : ''}`}
      style={
        isJoinable
          ? undefined
          : { backgroundColor: UNAVAILABLE_CARD_BACKGROUND }
      }
    >
      <View className="flex-row items-start justify-between gap-8">
        <Text
          numberOfLines={1}
          className={`text-body-2 shrink font-semibold ${isJoinable ? 'text-brand' : 'text-red-alert-dark'}`}
        >
          {result.name}
        </Text>
        <Text
          className={`text-label-1 font-semibold ${isJoinable ? 'text-placeholder' : 'text-secondary'}`}
        >
          {isJoinable ? formatTripMemberLimit(result) : '참여불가'}
        </Text>
      </View>
      <Text
        className={`text-caption-2 font-semibold ${isJoinable ? 'text-placeholder' : 'text-secondary'}`}
      >
        {formatTripDateRange(result.startDate, result.endDate)}
      </Text>
    </View>
  );
}
