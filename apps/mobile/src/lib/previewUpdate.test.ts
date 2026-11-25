import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

import { checkPreviewUpdateAsync } from '@/lib/previewUpdate';

jest.mock('expo-updates', () => ({
  isEnabled: true,
  channel: 'preview',
  checkForUpdateAsync: jest.fn(),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
}));

const mockedUpdates = jest.mocked(Updates) as jest.Mocked<typeof Updates> & {
  channel: string | null;
};

describe('checkPreviewUpdateAsync', () => {
  const isOriginalDev = __DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    // @ts-expect-error 테스트에서 릴리스 빌드처럼 동작시킨다
    global.__DEV__ = false;
    mockedUpdates.channel = 'preview';
  });

  afterAll(() => {
    // @ts-expect-error 원래 값으로 되돌린다
    global.__DEV__ = isOriginalDev;
  });

  it('preview 채널이 아니면 업데이트를 확인하지 않는다', async () => {
    mockedUpdates.channel = 'production';

    await checkPreviewUpdateAsync();

    expect(Updates.checkForUpdateAsync).not.toHaveBeenCalled();
  });

  it('새 업데이트를 받으면 재시작 알림을 띄우고, 재시작을 누르면 적용한다', async () => {
    jest
      .mocked(Updates.checkForUpdateAsync)
      .mockResolvedValue({ isAvailable: true } as never);
    jest
      .mocked(Updates.fetchUpdateAsync)
      .mockResolvedValue({ isNew: true } as never);

    await checkPreviewUpdateAsync();

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    const buttons = jest.mocked(Alert.alert).mock.calls[0][2];
    buttons?.find((button) => button.text === '재시작')?.onPress?.();
    expect(Updates.reloadAsync).toHaveBeenCalled();
  });

  it('업데이트가 없으면 알림을 띄우지 않는다', async () => {
    jest
      .mocked(Updates.checkForUpdateAsync)
      .mockResolvedValue({ isAvailable: false } as never);

    await checkPreviewUpdateAsync();

    expect(Updates.fetchUpdateAsync).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});
