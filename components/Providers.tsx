"use client";

import { ReactNode } from "react";
import { CacheProvider } from "@/lib/cacheContext";

export function Providers({ children }: { children: ReactNode }) {
  return <CacheProvider>{children}</CacheProvider>;
} 