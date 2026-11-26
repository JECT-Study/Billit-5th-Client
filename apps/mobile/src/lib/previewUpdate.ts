import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { Alert } from 'react-native';

const PREVIEW_CHANNEL = 'preview';

// preview 채널 빌드에서만 업데이트를 확인한다. 개발 서버, production 빌드는 건너뛴다.
export function isPreviewUpdateTarget() {
  return !__DEV__ && Updates.isEnabled && Updates.channel === PREVIEW_CHANNEL;
}

export async function checkPreviewUpdateAsync() {
  if (!isPreviewUpdateTarget()) return;

  try {
    const { isAvailable } = await Updates.checkForUpdateAsync();
    if (!isAvailable) return;

    const { isNew } = await Updates.fetchUpdateAsync();
    if (!isNew) return;

    Alert.alert('새 버전이 있어요', '지금 재시작해서 적용할까요?', [
      { text: '나중에', style: 'cancel' },
      {
        text: '재시작',
        onPress: () => {
          void Updates.reloadAsync();
        },
      },
    ]);
  } catch (error) {
    console.warn('업데이트를 확인하지 못했습니다.', error);
  }
}

export function usePreviewUpdate() {
  useEffect(() => {
    void checkPreviewUpdateAsync();
  }, []);
}
