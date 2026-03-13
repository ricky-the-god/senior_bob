import type { ReactNode } from "react";

export default function GuidedSetupLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col overflow-hidden">{children}</div>;
}
