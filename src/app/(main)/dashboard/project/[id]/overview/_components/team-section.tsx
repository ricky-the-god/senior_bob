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

      {members.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-card/30 px-4 py-6 text-center">
          <p className="text-muted-foreground/60 text-xs">No team members yet.</p>
        </div>
      )}

      {members.length > 0 && (
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="group flex items-center gap-2.5">
              <Avatar className="h-7 w-7 shrink-0 ring-1 ring-border">
                <AvatarImage src={member.avatar ?? undefined} alt={member.name ?? member.email} />
                <AvatarFallback className="text-[10px]">{initials(member)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                {member.name && <p className="truncate text-xs font-medium text-foreground">{member.name}</p>}
                <p className="truncate text-[11px] text-muted-foreground/60">{member.email}</p>
              </div>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => handleRemove(member.id)}
                  className="text-muted-foreground/40 opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
                  aria-label={`Remove ${member.email}`}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isOwner && (
        <>
          {showInput ? (
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
              className="w-full rounded-md border border-border border-dashed bg-transparent px-2 py-1.5 text-xs outline-none focus:border-foreground/30 disabled:opacity-50"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-muted-foreground text-xs hover:border-foreground/30 hover:text-foreground transition-colors"
            >
              <Plus className="size-3.5" />
              Invite member
            </button>
          )}
        </>
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}
    </section>
  );
}
