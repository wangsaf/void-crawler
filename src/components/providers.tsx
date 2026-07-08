"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useGameStore, detectCharacterClass } from "@/stores/game-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 2 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GameInitializer>{children}</GameInitializer>
    </QueryClientProvider>
  );
}

function GameInitializer({ children }: { children: React.ReactNode }) {
  const setCharacterClass = useGameStore((s) => s.setCharacterClass);

  useEffect(() => {
    const cls = detectCharacterClass();
    setCharacterClass(cls);
  }, [setCharacterClass]);

  return <>{children}</>;
}
