"use client";

import { useMemo } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { LucideIcon } from "lucide-react";
import { Compass, Database, Info, LayoutDashboard, Network, Package } from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type Props = {
  id: string;
  projectName: string;
};

export function ProjectNav({ id, projectName }: Props) {
  const pathname = usePathname();

  const navItems = useMemo<NavItem[]>(
    () => [
      { href: `/dashboard/project/${id}/guided-setup`, label: "Guided Setup", icon: Compass },
      { href: `/dashboard/project/${id}/overview`, label: "Overview", icon: Info },
      { href: `/dashboard/project/${id}/system-design`, label: "System Design", icon: Network },
      { href: `/dashboard/project/${id}/schema`, label: "Schema Visualizer", icon: Database },
      { href: `/dashboard/project/${id}/output-pack`, label: "Output Pack", icon: Package },
    ],
    [id],
  );

  return (
    <aside className="mr-6 flex w-52 flex-shrink-0 flex-col overflow-y-auto border-border border-r bg-card">
      {/* Project header */}
      <div className="flex items-center gap-2 border-border border-b px-3 py-3">
        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-foreground/8">
          <LayoutDashboard className="size-3 text-foreground/60" />
        </div>
        <p className="truncate font-medium text-foreground text-sm">{projectName}</p>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 p-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                active
                  ? "bg-foreground/8 text-foreground"
                  : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-3.5 flex-shrink-0 transition-colors",
                  active ? "text-foreground/80" : "text-muted-foreground/60",
                )}
              />
              <span className="text-sm">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
