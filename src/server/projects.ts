"use server";

import { redirect } from "next/navigation";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100).trim(),
});

export async function createProject(formData: FormData) {
  const { name } = CreateProjectSchema.parse({
    name: formData.get("name"),
  });

  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").insert({ name }).select("id").single();

  if (error) throw new Error(error.message);

  redirect(`/dashboard/canvas/${data.id}`);
}
