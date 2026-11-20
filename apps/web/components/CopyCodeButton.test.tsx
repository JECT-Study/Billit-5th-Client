import { act, fireEvent, render, screen } from '@testing-library/react';

import { CopyCodeButton } from './CopyCodeButton';

// jsdom에는 navigator.clipboard가 없어서 테스트마다 가짜로 끼운다.
// writeText를 안 넘기면 clipboard 자체가 없는 상황(HTTP 주소)이 된다.
function mockClipboard(writeText?: jest.Mock) {
  Object.defineProperty(navigator, 'clipboard', {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
}

function clickCopyButton() {
  fireEvent.click(screen.getByRole('button', { name: '코드 복사' }));
}

afterEach(() => {
  mockClipboard();
  jest.useRealTimers();
});

describe('CopyCodeButton', () => {
  it('클릭하면 코드를 복사하고 "복사됨"을 보여 준다', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    render(<CopyCodeButton code="ABC123" />);

    clickCopyButton();

    // 복사는 비동기라 findBy로 바뀔 때까지 기다린다
    await screen.findByRole('button', { name: '복사됨' });
    expect(writeText).toHaveBeenCalledWith('ABC123');
  });

  it('"복사됨"은 2초 뒤 원래 문구로 돌아간다', async () => {
    jest.useFakeTimers();
    mockClipboard(jest.fn().mockResolvedValue(undefined));
    render(<CopyCodeButton code="ABC123" />);

    clickCopyButton();
    await screen.findByRole('button', { name: '복사됨' });

    // 실제로 2초 기다리지 않고 시계를 건너뛴다
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    screen.getByRole('button', { name: '코드 복사' });
  });

  it('복사가 거부되면 직접 복사하라는 안내를 보여 준다', async () => {
    mockClipboard(jest.fn().mockRejectedValue(new Error('denied')));
    render(<CopyCodeButton code="ABC123" />);

    clickCopyButton();

    await screen.findByText(/복사하지 못했어요/);
    // 실패하면 버튼 문구는 그대로다
    screen.getByRole('button', { name: '코드 복사' });
  });

  it('clipboard API가 없으면(HTTP 주소) 안내를 보여 준다', async () => {
    mockClipboard();
    render(<CopyCodeButton code="ABC123" />);

    clickCopyButton();

    await screen.findByText(/복사하지 못했어요/);
  });
});
