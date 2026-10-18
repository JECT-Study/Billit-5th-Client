import { apiBaseUrl } from '@/lib/api';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-brand text-3xl font-bold">Billit</h1>
        <p className="text-neutral-700">API {apiBaseUrl}</p>
      </div>
    </main>
  );
}
