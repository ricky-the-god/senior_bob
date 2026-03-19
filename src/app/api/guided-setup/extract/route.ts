import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

const MessagePartSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
});

const MessageSchema = z.object({
  role: z.string().optional(),
  parts: z.array(MessagePartSchema).optional(),
  content: z.string().optional(),
});

const RequestSchema = z.object({
  messages: z.array(MessageSchema),
  step: z.enum(["workflow", "features", "integrations"]),
  projectId: z.string().uuid(),
});

const WorkflowExtract = z.object({
  mainGoal: z.string(),
  mainFlow: z.string(),
  seniorbobSummary: z.string(), // one sentence: "A [type] app that [does X] for [who]"
});

const FeaturesExtract = z.object({
  selected: z.array(z.string()),
  custom: z.array(z.string()),
  seniorbobSummary: z.string(), // one sentence summarizing the feature set
});

const IntegrationsExtract = z.object({
  tools: z.array(z.string()),
  constraints: z.string(),
  stackPreference: z.string(),
  seniorbobSummary: z.string(), // one sentence summarizing integration choices
});

const STEP_SCHEMA = {
  workflow: WorkflowExtract,
  features: FeaturesExtract,
  integrations: IntegrationsExtract,
};

function buildTranscript(messages: z.infer<typeof MessageSchema>[]): string {
  return messages
    .map((m) => {
      const role = m.role === "assistant" ? "Assistant" : "User";
      const text = m.parts ? m.parts.map((p) => (p.type === "text" ? (p.text ?? "") : "")).join("") : (m.content ?? "");
      return `${role}: ${text.replace("[[READY]]", "").trim()}`;
    })
    .filter((line) => !line.endsWith(":"))
    .join("\n");
}

export async function POST(req: Request) {
  // Auth guard — API routes are not covered by middleware
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // Rate limit: max 20 requests per 60 seconds per user (best-effort, in-memory)
  if (!checkRateLimit(user.id, "guided-setup-extract", 20, 60_000)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const parse = RequestSchema.safeParse(await req.json());
  if (!parse.success) return new Response("Bad Request", { status: 400 });

  const { messages, step, projectId } = parse.data;

  // Ownership check — prevent using another user's project ID to burn credits
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();
  if (!project) return new Response("Not Found", { status: 404 });

  const transcript = buildTranscript(messages);
  const schema = STEP_SCHEMA[step];

  const { object } = await generateObject({
    model: groq("openai/gpt-oss-120b"),
    schema,
    prompt: `Extract the structured data from this conversation transcript. For seniorbobSummary, write one concise sentence from SeniorBob's perspective summarizing what was learned in this step.\n\n${transcript}`,
  });

  return Response.json(object);
}
