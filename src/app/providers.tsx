"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {

  const queryClient = new QueryClient({
    defaultOptions:{
      queries:{
        staleTime:60*1000
      }
    }
  });
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider refetchInterval={5*50} refetchOnWindowFocus={true}>{children}</SessionProvider>
    </QueryClientProvider>
  );
}
