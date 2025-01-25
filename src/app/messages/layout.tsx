"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-gradient-to-b from-[#F7F1EE] to-[#E5DEDB] min-h-screen">
        <div className="relative ">{children}</div>
      </div>
    </QueryClientProvider>
  );
}
