import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

import { APP_TYPE_IDS, BACKEND_IDS, INFRA_IDS, USER_SCALE_IDS } from "@/lib/project-types";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 15;

const RequestSchema = z.object({
  description: z.string().min(10).max(1000),
});

const ResponseSchema = z.object({
  app_type: z.enum(APP_TYPE_IDS),
  app_type_reason: z.string(),
  is_new_app: z.boolean(),
  is_new_app_reason: z.string(),
  tech_stack: z.array(z.string()),
  tech_stack_reason: z.string(),
  user_scale: z.enum(USER_SCALE_IDS),
  user_scale_reason: z.string(),
  infra: z.enum(INFRA_IDS),
  infra_reason: z.string(),
  backend: z.enum(BACKEND_IDS),
  backend_reason: z.string(),
  suggested_name: z.string(),
  suggested_name_reason: z.string(),
});

const SYSTEM_PROMPT = `You are a senior software architect. Given a project description, recommend the best architecture choices. Be opinionated and decisive. Each reason must be ≤1 sentence. For tech_stack, return 3–6 common technologies appropriate for the project (e.g. "React", "PostgreSQL", "Redis", "Docker"). For suggested_name, return a short, memorable project name (2–4 words, TitleCase).`;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null);
  const parse = RequestSchema.safeParse(body);
  if (!parse.success) return new Response("Bad Request", { status: 400 });

  // To use Ollama locally: install ollama-ai-provider, set USE_OLLAMA=true, and swap
  // the model below with: createOllama()("llama3.1")
  const { object } = await generateObject({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: SYSTEM_PROMPT,
    prompt: `Project description: ${parse.data.description}`,
    schema: ResponseSchema,
  });

  return Response.json(object);
}
