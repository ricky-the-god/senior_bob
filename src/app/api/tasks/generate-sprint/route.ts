import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

import { buildRequirementsBlock } from "@/lib/ai-context";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

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

const ExistingSprintSchema = z.object({
  id: z.string(),
  name: z.string(),
  goal: z.string(),
  tasks: z.array(z.unknown()).max(20),
});

const RequestSchema = z.object({
  projectId: z.string().uuid(),
  sprintId: z.enum(["sprint-2", "sprint-3"]),
  existingSprints: z.array(ExistingSprintSchema).min(1).max(3),
  diagram: z
    .object({
      nodes: z.array(z.unknown()).max(100),
      edges: z.array(z.unknown()).max(200),
    })
    .optional(),
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

const ResponseSchema = z.object({
  tasks: z.array(TaskSchema).min(3).max(6),
});

const SYSTEM_PROMPT = `You are a senior software architect and engineering manager. You are generating tasks for a specific sprint in a 3-sprint engineering backlog. You will be given the completed previous sprint context and the stub (name + goal) for the sprint you must fill.

Generate exactly 3–6 focused tasks for the requested sprint. Follow the sprint's stated goal. Each task must reference a specific system component, have an actionable title, concise technical description (1-2 sentences), T-shirt size (xs=1h, s=2-4h, m=4-8h, l=1-2d, xl=2-5d), and priority. Task IDs must be unique and follow the pattern "task-{sprint-number}-{n}" (e.g., "task-2-1" for sprint-2). All tasks start with status "todo".

For each task, set "platform" to the primary tool needed to execute it. Use one of:
- "Claude Code" — for any coding, implementation, or refactoring task
- "Terminal" — for CLI operations, migrations, scripts, package installs
- "GitHub" — for repo setup, CI/CD config, PR workflows, branch protection
- "AWS Console" / "Vercel Dashboard" / "Supabase Dashboard" — for cloud infrastructure provisioning
- "Figma" — for design tasks
Use the most specific platform. Default to "Claude Code" for general coding tasks.`;

export async function POST(req: Request) {
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

  const { projectId, sprintId, existingSprints, diagram, context } = parse.data;

  // Ownership check — prevent generating sprint tasks for another user's project
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();
  if (!project) return new Response("Forbidden", { status: 403 });

  const targetSprint = existingSprints.find((s) => s.id === sprintId);
  if (!targetSprint) return new Response("Sprint not found", { status: 400 });

  const sprintNumber = sprintId === "sprint-2" ? 2 : 3;
  const previousSprints = existingSprints.filter((s) => s.id !== sprintId);

  const requirementsSection = context
    ? `\n${buildRequirementsBlock({
        wizardDescription: context.wizard_description,
        appType: context.app_type,
        guidedSetup: context.guided_setup ?? undefined,
      })}`
    : "";

  const userMessage = `Sprint to generate tasks for:
- ID: ${sprintId}
- Name: ${targetSprint.name}
- Goal: ${targetSprint.goal}

Previously completed sprints:
${previousSprints.map((s) => `Sprint "${s.name}" (${s.id}): ${s.goal}`).join("\n")}

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

${diagram ? `System design diagram:\n${JSON.stringify(diagram, null, 2)}` : ""}

Generate 3–6 tasks for Sprint ${sprintNumber} ("${targetSprint.name}"). Task IDs must use the prefix "task-${sprintNumber}-".`;

  const { object } = await generateObject({
    model: groq("openai/gpt-oss-120b"),
    system: SYSTEM_PROMPT,
    prompt: userMessage,
    schema: ResponseSchema,
  });

  return Response.json(object);
}
