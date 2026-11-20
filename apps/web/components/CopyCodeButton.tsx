'use client';

import { useEffect, useState } from 'react';

type CopyStatus = 'idle' | 'copied' | 'failed';

type CopyCodeButtonProps = {
  code: string;
};

export function CopyCodeButton({ code }: CopyCodeButtonProps) {
  const [status, setStatus] = useState<CopyStatus>('idle');

  useEffect(() => {
    if (status !== 'copied') return;
    const timer = setTimeout(() => setStatus('idle'), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  async function handleClick() {
    try {
      // HTTP 주소에서는 navigator.clipboard가 아예 없음
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(code);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        className="bg-brand text-brand-foreground rounded-lg px-4 py-3 font-semibold"
      >
        {status === 'copied' ? '복사됨' : '코드 복사'}
      </button>
      <p aria-live="polite" className="text-sm text-neutral-500">
        {status === 'failed' &&
          '복사하지 못했어요. 코드를 길게 눌러 직접 복사해 주세요.'}
      </p>
    </div>
  );
}
