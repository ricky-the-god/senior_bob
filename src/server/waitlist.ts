"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/server/auth";

const joinSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().max(100).optional(),
});

export type JoinWaitlistResult = { success: true; message: string } | { success: false; error: string };

// Public action — no authentication required.
// RLS "public_insert" policy allows unauthenticated inserts.
export async function joinWaitlist(formData: FormData): Promise<JoinWaitlistResult> {
  const parsed = joinSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist").insert({
    email: parsed.data.email,
    name: parsed.data.name ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: true, message: "You're already on the waitlist!" };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }

  return { success: true, message: "You're on the list! We'll be in touch." };
}

export type WaitlistEntry = {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
};

// Admin-only. Throws "Forbidden" if caller is not the designated admin.
export async function getWaitlist(): Promise<WaitlistEntry[]> {
  const { user } = await getAuthenticatedUser();

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    throw new Error("Forbidden");
  }

  const supabase = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data, error } = await supabase
    .from("waitlist")
    .select("id, email, name, created_at")
    .returns<WaitlistEntry[]>()
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
