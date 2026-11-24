// 팝오버를 띄울 기준 요소의 화면 좌표(measureInWindow 기준)
export type PopoverAnchor = {
  top: number;
  bottom: number;
};

// 팝오버를 그릴 수 있는 화면 범위(안전영역 안쪽)
export type PopoverBounds = {
  top: number;
  bottom: number;
};

// 아래에 공간이 충분하면 기준 요소 아래에, 모자라면 위에 띄운다.
// 위아래 모두 모자라면 화면 위쪽 끝에 맞춰 최대한 많이 보이게 한다.
export function getPopoverTop(
  anchor: PopoverAnchor,
  popoverHeight: number,
  bounds: PopoverBounds,
  gap: number,
) {
  const belowTop = anchor.bottom + gap;
  if (belowTop + popoverHeight <= bounds.bottom) return belowTop;

  const aboveTop = anchor.top - gap - popoverHeight;
  return Math.max(bounds.top, aboveTop);
}
