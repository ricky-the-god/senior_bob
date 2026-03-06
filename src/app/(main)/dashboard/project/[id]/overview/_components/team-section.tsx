"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Plus, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ProjectMember } from "@/lib/queries/get-project-members";
import { addMember, removeMember } from "@/server/project-members";

type Props = {
  projectId: string;
  members: ProjectMember[];
  isOwner: boolean;
};

export function TeamSection({ projectId, members: initial, isOwner }: Props) {
  const [members, setMembers] = useState(initial);
  const [emailInput, setEmailInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus email input when it appears (replaces autoFocus)
  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  function inviteMember() {
    const email = emailInput.trim();
    if (!email) {
      setShowInput(false);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await addMember(projectId, email);
        setEmailInput("");
        setShowInput(false);
        // Optimistic member display — will show on next server refresh
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to add member");
      }
    });
  }

  function handleRemove(memberId: string) {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    startTransition(async () => {
      try {
        await removeMember(memberId);
      } catch {
        setMembers(initial); // revert on error
      }
    });
  }

  function initials(member: ProjectMember) {
    return (member.name ?? member.email).slice(0, 2).toUpperCase();
  }

  return (
    <section className="space-y-3">
      <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Team</h2>

      <div className="flex flex-wrap items-center gap-2">
        {members.map((member) => (
          <div key={member.id} className="group relative">
            <Avatar className="h-7 w-7 ring-1 ring-border">
              <AvatarImage src={member.avatar ?? undefined} alt={member.name ?? member.email} />
              <AvatarFallback className="text-[10px]">{initials(member)}</AvatarFallback>
            </Avatar>
            {isOwner && (
              <button
                type="button"
                onClick={() => handleRemove(member.id)}
                className="-top-1 -right-1 absolute hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-destructive-foreground group-hover:flex"
                aria-label={`Remove ${member.email}`}
              >
                <X className="size-2" />
              </button>
            )}
          </div>
        ))}

        {isOwner &&
          (showInput ? (
            <div className="flex items-center gap-1">
              <input
                ref={inputRef}
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onBlur={inviteMember}
                onKeyDown={(e) => {
                  if (e.key === "Enter") inviteMember();
                  if (e.key === "Escape") {
                    setEmailInput("");
                    setShowInput(false);
                  }
                }}
                placeholder="user@example.com"
                disabled={isPending}
                className="w-40 rounded-md border border-border border-dashed bg-transparent px-2 py-0.5 text-xs outline-none focus:border-foreground/30 disabled:opacity-50"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border border-dashed text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              aria-label="Add member"
            >
              <Plus className="size-3.5" />
            </button>
          ))}
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </section>
  );
}
