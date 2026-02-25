"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { Clock, FileText, Folder, Hash, Users } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import { useSearch } from "./search-context";

// Mock data - in real app, this would come from API/database
const mockProjects = [
  { id: "1", name: "E-commerce Platform", type: "project", url: "/dashboard/projects/1" },
  { id: "2", name: "Mobile App Redesign", type: "project", url: "/dashboard/projects/2" },
  { id: "3", name: "API Gateway Architecture", type: "project", url: "/dashboard/projects/3" },
  { id: "4", name: "Data Pipeline System", type: "project", url: "/dashboard/projects/4" },
];

const mockDrafts = [
  { id: "1", name: "Untitled Draft", type: "draft", url: "/dashboard/drafts/1" },
  { id: "2", name: "Authentication Flow", type: "draft", url: "/dashboard/drafts/2" },
  { id: "3", name: "Database Schema v2", type: "draft", url: "/dashboard/drafts/3" },
];

const mockTeams = [
  { id: "1", name: "Engineering", type: "team", url: "/dashboard/team/engineering" },
  { id: "2", name: "Design", type: "team", url: "/dashboard/team/design" },
  { id: "3", name: "Product", type: "team", url: "/dashboard/team/product" },
];

const recentSearches = [
  { id: "1", name: "E-commerce Platform", type: "recent", url: "/dashboard/projects/1" },
  { id: "2", name: "Engineering", type: "recent", url: "/dashboard/team/engineering" },
];

export function SearchDialog() {
  const { isOpen, closeSearch } = useSearch();
  const router = useRouter();

  // Keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        closeSearch();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [closeSearch]);

  const handleSelect = (url: string) => {
    closeSearch();
    router.push(url);
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={(open) => !open && closeSearch()}>
      <CommandInput placeholder="Search projects, drafts, teams..." />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <div className="rounded-full bg-muted p-3">
              <Folder className="size-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No results found</p>
            <p className="text-muted-foreground/70 text-xs">Try searching for something else</p>
          </div>
        </CommandEmpty>

        {/* Recent Searches */}
        <CommandGroup heading="Recent">
          {recentSearches.map((item) => (
            <CommandItem
              key={`recent-${item.id}`}
              value={item.name}
              onSelect={() => handleSelect(item.url)}
              className="gap-3"
            >
              <Clock className="size-4 text-muted-foreground" />
              <span>{item.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Projects */}
        <CommandGroup heading="Projects">
          {mockProjects.map((project) => (
            <CommandItem
              key={`project-${project.id}`}
              value={project.name}
              onSelect={() => handleSelect(project.url)}
              className="gap-3"
            >
              <Folder className="size-4 text-muted-foreground" />
              <span>{project.name}</span>
              <span className="ml-auto text-muted-foreground text-xs">Project</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Drafts */}
        <CommandGroup heading="Drafts">
          {mockDrafts.map((draft) => (
            <CommandItem
              key={`draft-${draft.id}`}
              value={draft.name}
              onSelect={() => handleSelect(draft.url)}
              className="gap-3"
            >
              <FileText className="size-4 text-muted-foreground" />
              <span>{draft.name}</span>
              <span className="ml-auto text-muted-foreground text-xs">Draft</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Teams */}
        <CommandGroup heading="Teams">
          {mockTeams.map((team) => (
            <CommandItem
              key={`team-${team.id}`}
              value={team.name}
              onSelect={() => handleSelect(team.url)}
              className="gap-3"
            >
              <Users className="size-4 text-muted-foreground" />
              <span>{team.name}</span>
              <span className="ml-auto text-muted-foreground text-xs">Team</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>

      {/* Footer with keyboard hint */}
      <div className="flex items-center justify-between border-t px-3 py-2 text-muted-foreground text-xs">
        <div className="flex items-center gap-2">
          <Hash className="size-3" />
          <span>Type to search</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-medium text-[10px]">↵</kbd>
          <span>to select</span>
        </div>
      </div>
    </CommandDialog>
  );
}
