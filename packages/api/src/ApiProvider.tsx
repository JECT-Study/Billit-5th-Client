'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import { createContext, useContext, useState, type ReactNode } from 'react';

const ApiContext = createContext<AxiosInstance | null>(null);

export function ApiProvider({
  client,
  children,
}: {
  client: AxiosInstance;
  children: ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ApiContext.Provider value={client}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiContext.Provider>
  );
}

export function useApiClient() {
  const client = useContext(ApiContext);
  if (!client) {
    throw new Error('ApiProvider가 트리 상단에 필요합니다.');
  }
  return client;
}
