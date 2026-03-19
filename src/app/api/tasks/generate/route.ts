import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

import { buildRequirementsBlock } from "@/lib/ai-context";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

const RequestSchema = z.object({
  projectId: z.string().uuid(),
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
      guided_setup: z
        .object({
          workflow: z.object({ mainGoal: z.string(), mainFlow: z.string() }).optional(),
          features: z.object({ selected: z.array(z.string()), custom: z.array(z.string()) }).optional(),
          integrations: z
            .object({
              tools: z.array(z.string()),
              constraints: z.string().nullable().optional(),
              stackPreference: z.string().nullable().optional(),
            })
            .optional(),
        })
        .optional(),
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
  platform: z.string(),
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

const SYSTEM_PROMPT = `You are a senior software architect and engineering manager. Given a system design diagram (React Flow nodes/edges), decompose it into a 3-sprint engineering backlog following infrastructure-first ordering (infra → core services → integration/polish).

IMPORTANT: Generate ONLY Sprint 1 with full tasks (3–6 tasks). For Sprints 2 and 3, return only id, name, and goal with tasks: []. Sprints 2 and 3 are stubs — their tasks will be generated on-demand when the previous sprint is complete.

Sprint IDs must be exactly: "sprint-1", "sprint-2", "sprint-3". Task IDs should be unique strings like "task-{sprint}-{n}". Each Sprint 1 task must reference a specific diagram component, have an actionable title, concise technical description (1-2 sentences), T-shirt size (xs=1h, s=2-4h, m=4-8h, l=1-2d, xl=2-5d), and priority. Sprint names and goals for all 3 sprints should reflect a coherent infrastructure-first progression.

For each task, set "platform" to the primary tool needed to execute it. Use one of:
- "Claude Code" — for any coding, implementation, or refactoring task
- "Terminal" — for CLI operations, migrations, scripts, package installs
- "GitHub" — for repo setup, CI/CD config, PR workflows, branch protection
- "AWS Console" / "Vercel Dashboard" / "Supabase Dashboard" — for cloud infrastructure provisioning
- "Figma" — for design tasks
Use the most specific platform. Default to "Claude Code" for general coding tasks.`;

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

  const { projectId, diagram, context } = parse.data;

  // Ownership check — prevent generating tasks for another user's project
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();
  if (!project) return new Response("Forbidden", { status: 403 });

  const requirementsSection = context
    ? `\n\n${buildRequirementsBlock({
        wizardDescription: context.wizard_description,
        appType: context.app_type,
        guidedSetup: context.guided_setup ?? undefined,
      })}`
    : "";

  const userMessage = `System design diagram:
${JSON.stringify(diagram, null, 2)}

${
  context
    ? `Project context:
- App type: ${context.app_type ?? "unknown"}
- Tech stack: ${context.tech_stack?.join(", ") ?? "unknown"}
- Infrastructure: ${context.infra ?? "unknown"}
- Backend: ${context.backend ?? "unknown"}
- Description: ${context.wizard_description ?? "none"}${requirementsSection}`
    : ""
}

Decompose this system design into a 3-sprint engineering backlog. Return Sprint 1 with 3–6 full tasks, and Sprints 2 and 3 as stubs (tasks: []).`;

  const { object } = await generateObject({
    model: groq("openai/gpt-oss-120b"),
    system: SYSTEM_PROMPT,
    prompt: userMessage,
    schema: ResponseSchema,
  });

  return Response.json(object);
}
