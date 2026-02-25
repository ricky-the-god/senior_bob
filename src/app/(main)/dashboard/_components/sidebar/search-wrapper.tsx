"use client";

import type { ReactNode } from "react";

import { SearchProvider } from "./search-context";
import { SearchDialog } from "./search-dialog";

export function SearchWrapper({ children }: { children: ReactNode }) {
  return (
    <SearchProvider>
      {children}
      <SearchDialog />
    </SearchProvider>
  );
}
