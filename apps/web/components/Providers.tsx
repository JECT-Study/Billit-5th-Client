'use client';

import { ApiProvider } from '@billit/api/client';
import type { ReactNode } from 'react';

import { apiClient } from '@/lib/api';

export function Providers({ children }: { children: ReactNode }) {
  return <ApiProvider client={apiClient}>{children}</ApiProvider>;
}
