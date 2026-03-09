import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

const RequestSchema = z.object({
  diagram: z.object({
    nodes: z.array(z.unknown()).max(100),
    edges: z.array(z.unknown()).max(200),
  }),
  context: z
    .object({
      app_type: z.string().optional(),
      tech_stack: z.array(z.string()).optional(),
      wizard_description: z.string().max(1000).optional(),
      infra: z.string().optional(),
      backend: z.string().optional(),
    })
    .optional(),
});

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(["critical", "high", "medium", "low"]),
  size: z.enum(["xs", "s", "m", "l", "xl"]),
  component: z.string(),
  status: z.literal("todo"),
});

const SprintSchema = z.object({
  id: z.string(),
  name: z.string(),
  goal: z.string(),
  tasks: z.array(TaskSchema),
});

const ResponseSchema = z.object({
  sprints: z.array(SprintSchema),
});

const SYSTEM_PROMPT = `You are a senior software architect and engineering manager. Given a system design diagram (React Flow nodes/edges), decompose it into a 3-sprint engineering backlog. Follow infrastructure-first ordering (infra → core services → integration/polish). Each sprint has 3–6 focused tasks. Each task must reference a specific diagram component, have an actionable title, concise technical description (1-2 sentences), T-shirt size (xs=1h, s=2-4h, m=4-8h, l=1-2d, xl=2-5d), and priority. Sprint IDs should be "sprint-1", "sprint-2", "sprint-3". Task IDs should be unique strings like "task-{sprint}-{n}".`;

export async function POST(req: Request) {
  // Auth guard — API routes are not covered by middleware
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const parse = RequestSchema.safeParse(body);
  if (!parse.success) return new Response("Bad Request", { status: 400 });

  const { diagram, context } = parse.data;

  const userMessage = `System design diagram:
${JSON.stringify(diagram, null, 2)}

${
  context
    ? `Project context:
- App type: ${context.app_type ?? "unknown"}
- Tech stack: ${context.tech_stack?.join(", ") ?? "unknown"}
- Infrastructure: ${context.infra ?? "unknown"}
- Backend: ${context.backend ?? "unknown"}
- Description: ${context.wizard_description ?? "none"}`
    : ""
}

Decompose this system design into a 3-sprint engineering backlog.`;

  const { object } = await generateObject({
    model: groq("openai/gpt-oss-120b"),
    system: SYSTEM_PROMPT,
    prompt: userMessage,
    schema: ResponseSchema,
  });

  return Response.json(object);
}
