"use client";

import { useRouter } from "next/navigation";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/v3/login");
  };

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleSignOut} aria-label="Sign out">
      <LogOut className="size-4" />
    </Button>
  );
}
