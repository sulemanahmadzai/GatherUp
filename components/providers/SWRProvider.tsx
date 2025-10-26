"use client";

import { SWRConfig } from "swr";

interface SWRProviderProps {
  children: React.ReactNode;
  fallback?: Record<string, any>;
}

export default function SWRProvider({ children, fallback }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fallback: fallback || {},
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
