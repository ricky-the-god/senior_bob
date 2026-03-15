import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

import type { OutputFile } from "@/lib/project-types";
import { parseProjectMeta } from "@/lib/project-types";
import { getDiagram } from "@/lib/queries/get-diagram";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const RequestSchema = z.object({
  projectId: z.string().uuid(),
});

const ResponseSchema = z.object({
  files: z.array(
    z.object({
      filename: z.string(),
      content: z.string(),
    }),
  ),
});

// Loose types for React Flow node/edge data shapes coming from the DB
type Nodeish = { data?: { label?: string; type?: string } };
type Edgeish = { source?: string; target?: string };

const SYSTEM_PROMPT = `You are a senior software architect. Given a project's context, generate exactly 5 markdown files that serve as implementation-ready context for Claude Code.

The 5 files must be (in order):
1. project-overview.md — Project name, type, one-liner goal, tech stack, key constraints
2. requirements.md — Main goal, primary user flow, features (selected + custom), integrations, constraints
3. architecture-decisions.md — ADRs inferred from the diagram (why specific choices were made, storage, auth, scalability)
4. claude-code-architecture-prompt.md — Full system context for Claude Code, the "big picture" prompt that gives an AI coder everything needed to understand the project
5. claude-code-task-prompt.md — Sprint 1 task list formatted as a Claude Code implementation prompt, ready to paste

Rules:
- Each file should be pure markdown optimized for copy-pasting into Claude Code
- Be concise but complete — no filler prose
- Use headers, bullet lists, and code blocks where appropriate
- Write like a senior engineer writing context for their team, not like marketing copy
- architecture-decisions.md should use proper ADR format: Context / Decision / Consequences
- claude-code-architecture-prompt.md should start with "You are working on:" and give full context
- claude-code-task-prompt.md should be ready-to-paste as a Claude Code session opener`;

export async function POST(req: Request) {
  // Validate input before authenticating — fail fast on bad data
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const parse = RequestSchema.safeParse(body);
  if (!parse.success) return new Response("Bad Request", { status: 400 });

  const { projectId } = parse.data;

  // Auth guard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // Fetch project with ownership check
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name, description")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();

  if (projectError || !project) return new Response("Not Found", { status: 404 });

  const meta = parseProjectMeta(project.description ?? null);

  // Fetch diagram
  const diagram = await getDiagram(projectId, "system-design");
  const diagramData = diagram?.data as { nodes?: unknown[]; edges?: unknown[] } | null;

  // Build node/edge summary for prompt
  const nodeSummary =
    diagramData?.nodes
      ?.slice(0, 30)
      .map((n) => {
        const node = n as Nodeish;
        return `- ${node.data?.type ?? "node"}: ${node.data?.label ?? "unlabeled"}`;
      })
      .join("\n") ?? "No diagram nodes";

  const edgeSummary =
    diagramData?.edges
      ?.slice(0, 50)
      .map((e) => {
        const edge = e as Edgeish;
        return `${edge.source} → ${edge.target}`;
      })
      .join(", ") ?? "No connections";

  // Sprint 1 tasks
  const sprint1 = meta.task_sprints?.[0];
  const sprint1Summary = sprint1
    ? `Sprint 1: ${sprint1.name}\nGoal: ${sprint1.goal}\nTasks:\n${sprint1.tasks.map((t) => `- [${t.priority}] ${t.title} (${t.size})`).join("\n")}`
    : "No tasks generated yet";

  const userMessage = `Project: ${project.name}
App type: ${meta.app_type ?? "unknown"}
Tech stack: ${meta.tech_stack?.join(", ") ?? "not specified"}
Infrastructure: ${meta.infra ?? "not specified"}
Backend: ${meta.backend ?? "not specified"}
Description: ${meta.wizard_description ?? "none"}

Guided Setup:
- Main goal: ${meta.guided_setup?.workflow?.mainGoal ?? "not specified"}
- Primary user flow: ${meta.guided_setup?.workflow?.mainFlow ?? "not specified"}
- Selected features: ${meta.guided_setup?.features?.selected?.join(", ") ?? "none"}
- Custom features: ${meta.guided_setup?.features?.custom?.join(", ") ?? "none"}
- Tools/integrations: ${meta.guided_setup?.integrations?.tools?.join(", ") ?? "none"}
- Constraints: ${meta.guided_setup?.integrations?.constraints ?? "none"}
- Stack preference: ${meta.guided_setup?.integrations?.stackPreference ?? "none"}

System Design Diagram:
Nodes:
${nodeSummary}

Connections: ${edgeSummary}

${sprint1Summary}

Generate the 5 markdown files described in your instructions.`;

  const { object } = await generateObject({
    model: groq("openai/gpt-oss-120b"),
    system: SYSTEM_PROMPT,
    prompt: userMessage,
    schema: ResponseSchema,
  });

  const now = new Date().toISOString();
  const outputFiles: OutputFile[] = object.files.map((f) => ({
    filename: f.filename,
    content: f.content,
    generated_at: now,
  }));

  // Persist to project description
  let current: Record<string, unknown> = {};
  try {
    if (project.description) current = JSON.parse(project.description) as Record<string, unknown>;
  } catch {
    // malformed — start fresh
  }

  const merged = {
    ...current,
    output_pack: {
      files: outputFiles,
      generated_at: now,
    },
  };

  const { error: updateError } = await supabase
    .from("projects")
    .update({ description: JSON.stringify(merged) })
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (updateError) return new Response("Failed to persist output pack", { status: 500 });

  return Response.json({ files: outputFiles });
}
