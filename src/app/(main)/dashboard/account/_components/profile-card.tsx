import { CalendarDays, Mail } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProfileCardProps {
  name: string;
  email: string;
  avatarUrl: string | null;
  memberSince: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileCard({ name, email, avatarUrl, memberSince }: ProfileCardProps) {
  const memberSinceLabel = new Date(memberSince).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative shrink-0">
          <Avatar className="h-20 w-20 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
            <AvatarImage src={avatarUrl ?? undefined} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-card bg-emerald-500" />
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-foreground text-xl leading-tight">{name}</h2>
            <Badge variant="secondary" className="text-xs">
              Free Plan
            </Badge>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Mail className="size-3.5 shrink-0" />
              <span>{email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <CalendarDays className="size-3.5 shrink-0" />
              <span>Member since {memberSinceLabel}</span>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" disabled className="shrink-0 self-start sm:self-center">
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
