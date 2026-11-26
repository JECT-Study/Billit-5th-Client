import { getPopoverTop } from '@/shared/ui/popoverPosition';

const bounds = { top: 50, bottom: 800 };
const GAP = 6;

describe('getPopoverTop', () => {
  it('아래에 공간이 충분하면 기준 요소 아래에 띄운다', () => {
    expect(getPopoverTop({ top: 200, bottom: 246 }, 350, bounds, GAP)).toBe(
      252,
    );
  });

  it('아래 공간에 딱 맞으면 아래에 띄운다', () => {
    expect(getPopoverTop({ top: 398, bottom: 444 }, 350, bounds, GAP)).toBe(
      450,
    );
  });

  it('아래 공간이 모자라면 기준 요소 위에 띄운다', () => {
    expect(getPopoverTop({ top: 520, bottom: 566 }, 350, bounds, GAP)).toBe(
      164,
    );
  });

  it('위아래 모두 모자라면 화면 위쪽 끝에 맞춘다', () => {
    expect(getPopoverTop({ top: 300, bottom: 346 }, 600, bounds, GAP)).toBe(50);
  });
});
