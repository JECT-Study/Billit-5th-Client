// 컨테이너 HEALTHCHECK용 생존 확인
export const dynamic = 'force-dynamic';

export function GET() {
  return new Response('ok', {
    headers: { 'Cache-Control': 'no-store' },
  });
}
