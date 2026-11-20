import { render, screen } from '@testing-library/react';

import { StoreButtons } from './StoreButtons';

const APP_STORE_URL = 'https://apps.apple.com/app/id000';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=test';

function queryAppStoreLink() {
  return screen.queryByRole('link', { name: 'App Store에서 받기' });
}

function queryPlayStoreLink() {
  return screen.queryByRole('link', { name: 'Google Play에서 받기' });
}

describe('StoreButtons', () => {
  it('URL이 둘 다 없으면 아무것도 그리지 않는다', () => {
    const { container } = render(<StoreButtons />);

    expect(container.innerHTML).toBe('');
  });

  it('App Store URL만 있으면 App Store 버튼만 보인다', () => {
    render(<StoreButtons appStoreUrl={APP_STORE_URL} />);

    expect(queryAppStoreLink()?.getAttribute('href')).toBe(APP_STORE_URL);
    expect(queryPlayStoreLink()).toBeNull();
  });

  it('Play 스토어 URL만 있으면 Google Play 버튼만 보인다', () => {
    render(<StoreButtons playStoreUrl={PLAY_STORE_URL} />);

    expect(queryAppStoreLink()).toBeNull();
    expect(queryPlayStoreLink()?.getAttribute('href')).toBe(PLAY_STORE_URL);
  });

  it('빈 문자열은 URL이 없는 것으로 본다', () => {
    render(<StoreButtons appStoreUrl="" playStoreUrl={PLAY_STORE_URL} />);

    expect(queryAppStoreLink()).toBeNull();
    expect(queryPlayStoreLink()).not.toBeNull();
  });

  it('둘 다 있으면 둘 다 보이고 새 탭으로 열린다', () => {
    render(
      <StoreButtons
        appStoreUrl={APP_STORE_URL}
        playStoreUrl={PLAY_STORE_URL}
      />,
    );

    for (const link of [queryAppStoreLink(), queryPlayStoreLink()]) {
      expect(link?.getAttribute('target')).toBe('_blank');
      expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });
});
