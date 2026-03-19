import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";

import { fetchFullContext } from "@/lib/ai-context";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

const RequestSchema = z.object({
  messages: z.array(z.unknown()),
  step: z.enum(["workflow", "features", "integrations"]),
  projectId: z.string().uuid(),
});

const SYSTEM_PROMPTS = {
  workflow: `You are SeniorBob, a friendly senior software architect helping a solo founder.
Goal: understand (1) mainGoal — what problem the app solves, and (2) mainFlow — the end-to-end user journey.
Ask one focused follow-up question if an answer is vague. Keep responses to 1-3 sentences, no bullet lists.
When you are confident in both answers, end your final message with [[READY]] on its own line.
Do not include [[READY]] in any earlier message.`,

  features: `You are SeniorBob, helping define core features for an app.
Standard feature categories: Authentication, Dashboard, CRUD data, AI generation, Notifications, Search & filtering, Payments, Admin panel, File upload, External API.
Goal: produce a complete feature list (selected from standard categories + any custom ones).
Ask follow-ups if mentions are vague. Be encouraging. Keep responses to 1-2 sentences.
When you have a complete realistic list, end your final message with [[READY]] on its own line.`,

  integrations: `You are SeniorBob, identifying external dependencies for an app.
Goal: capture (1) tools — specific third-party services, (2) constraints — hosting/compliance/budget, (3) stackPreference — opinionated tech choices.
Empty string is valid for constraints and stackPreference. Accept "none" without pushing back.
Keep responses to 1-2 sentences.
When you have enough for all three fields, end your final message with [[READY]] on its own line.`,
};

export async function POST(req: Request) {
  // Auth guard — API routes are not covered by middleware
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // Rate limit: max 20 requests per 60 seconds per user (best-effort, in-memory)
  if (!checkRateLimit(user.id, "guided-setup-chat", 20, 60_000)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const parse = RequestSchema.safeParse(await req.json());
  if (!parse.success) return new Response("Bad Request", { status: 400 });

  const { messages, step, projectId } = parse.data;

  // Ownership check
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();
  if (!project) return new Response("Not Found", { status: 404 });

  const context = await fetchFullContext(supabase, projectId, user.id, "guided-setup");
  const stepPrompt = SYSTEM_PROMPTS[step];
  const system = context ? `${context}${stepPrompt}` : stepPrompt;

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system,
    messages: await convertToModelMessages(messages as UIMessage[]),
  });

  return result.toUIMessageStreamResponse();
}
