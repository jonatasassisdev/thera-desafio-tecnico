"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { makeStore, type AppStore } from "@/store/store";
import { ToastViewport } from "@/components/ui/toast-viewport";
import { GlobalLoader } from "@/components/ui/global-loader";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GlobalLoader />
        {children}
        <ToastViewport />
      </QueryClientProvider>
    </Provider>
  );
}
