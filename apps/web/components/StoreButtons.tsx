type StoreButtonsProps = {
  appStoreUrl?: string;
  playStoreUrl?: string;
};

const buttonClassName =
  'rounded-lg border border-neutral-300 px-4 py-3 text-center font-semibold';

export function StoreButtons({ appStoreUrl, playStoreUrl }: StoreButtonsProps) {
  if (!appStoreUrl && !playStoreUrl) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* 값이 있을 때만 해당 버튼을 그린다 (조건부 렌더링) */}
      {appStoreUrl && (
        <a
          href={appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClassName}
        >
          App Store에서 받기
        </a>
      )}
      {playStoreUrl && (
        <a
          href={playStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClassName}
        >
          Google Play에서 받기
        </a>
      )}
    </div>
  );
}
