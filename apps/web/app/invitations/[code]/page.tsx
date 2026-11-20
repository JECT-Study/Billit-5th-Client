import { connection } from 'next/server';

import { CopyCodeButton } from '@/components/CopyCodeButton';
import { StoreButtons } from '@/components/StoreButtons';

type InvitationPageProps = {
  params: Promise<{ code: string }>;
};

export default async function InvitationPage({ params }: InvitationPageProps) {
  // /invitations/ABC123 으로 들어오면 code는 "ABC123"
  const { code } = await params;

  await connection();
  const appStoreUrl = process.env.APP_STORE_URL;
  const playStoreUrl = process.env.PLAY_STORE_URL;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Billit 여행에 초대받았어요</h1>
        <p className="text-neutral-600">
          Billit 앱을 설치한 뒤, 앱에서 아래 초대 코드를 입력하세요.
        </p>
      </div>

      {/* 초대 코드 상자 + 복사 버튼 */}
      <section className="flex flex-col gap-2">
        <span className="text-sm text-neutral-500">초대 코드</span>
        <p className="rounded-lg border border-neutral-200 px-4 py-3 text-center text-xl font-semibold tracking-widest">
          {code}
        </p>
        <CopyCodeButton code={code} />
      </section>

      {/* 스토어 버튼. URL이 없는 버튼은 숨겨짐 */}
      <StoreButtons appStoreUrl={appStoreUrl} playStoreUrl={playStoreUrl} />
    </main>
  );
}
