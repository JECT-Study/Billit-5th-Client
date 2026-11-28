import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InfoIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

type ToastProps = {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
  backgroundColor?: string;
  variant?: 'standard' | 'compact';
};

export const DEFAULT_TOAST_DURATION_MS = 2000;
// 시안은 상태바(46px) 아래 14px(화면 위에서 60px)에 둔다. 기기마다 안전영역이 달라서 inset에 더한다.
const TOP_OFFSET_FROM_SAFE_AREA = 14;

// Figma: Feedback / Toast, Type=standard (2260:17001), compact (2260:16998).
// 화면 전체를 채우는 부모 안에서 위쪽 가운데에 겹쳐 보이고 잠시 뒤 사라진다.
// SafeAreaView의 패딩은 absolute 자식에 적용되지 않으므로 안전영역 위쪽 값을 직접 더한다.
export function Toast({
  message,
  onDismiss,
  durationMs = DEFAULT_TOAST_DURATION_MS,
  backgroundColor,
  variant = 'standard',
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    function dismiss() {
      onDismissRef.current();
    }
    const timer = setTimeout(dismiss, durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs]);

  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0 items-center px-24"
      style={{ top: insets.top + TOP_OFFSET_FROM_SAFE_AREA }}
    >
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        className={
          variant === 'compact'
            ? 'h-36 flex-row items-center gap-6 rounded-full bg-black px-12 py-6'
            : 'bg-gray-1 rounded-12 min-h-[46px] flex-row items-center gap-6 p-10'
        }
        style={backgroundColor ? { backgroundColor } : undefined}
      >
        <InfoIcon
          color={
            variant === 'compact' ? COLORS.white : COLORS['red-alert-dark']
          }
        />
        <Text
          className={`${variant === 'compact' ? 'text-label-1' : 'text-caption-1'} shrink font-semibold`}
          style={{
            color:
              variant === 'compact' ? COLORS.white : COLORS['red-alert-dark'],
          }}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}
