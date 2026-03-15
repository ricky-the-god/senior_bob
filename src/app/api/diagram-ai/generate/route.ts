import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

import { fetchRequirementsBlock } from "@/lib/ai-context";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

const RequestSchema = z.object({
  prompt: z.string().min(1).max(3000),
  currentDiagram: z
    .object({
      nodes: z.array(z.unknown()).max(100),
      edges: z.array(z.unknown()).max(200),
    })
    .optional(),
  projectId: z.string().uuid().optional(),
});

const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(["service", "database", "cache", "queue", "gateway", "client", "external"]),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.object({ label: z.string(), sublabel: z.string() }),
});

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

const DiagramSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

type Handle = "top" | "bottom" | "left" | "right";

/** Deterministically pick the best source/target handles from node center positions. */
function resolveHandles(
  src: { x: number; y: number },
  tgt: { x: number; y: number },
): { sourceHandle: Handle; targetHandle: Handle } {
  const dx = tgt.x - src.x;
  const dy = tgt.y - src.y;

  // Prefer the axis with the greater absolute distance
  if (Math.abs(dy) >= Math.abs(dx)) {
    return dy >= 0 ? { sourceHandle: "bottom", targetHandle: "top" } : { sourceHandle: "top", targetHandle: "bottom" };
  }
  return dx >= 0 ? { sourceHandle: "right", targetHandle: "left" } : { sourceHandle: "left", targetHandle: "right" };
}

const BASE_SYSTEM_PROMPT = `You are a senior system architecture expert. Given a natural language instruction,
generate React Flow nodes and edges to add to or update a system design diagram.

Layout guidelines:
- Clients at top (y: 0), gateways below (y: 120), services in the middle (y: 260), databases/caches at bottom (y: 400)
- Space nodes horizontally with x intervals of 200px
- Edge ids must be "e-{source}-{target}"
- Only output NEW nodes/edges that should be added; do not repeat existing ones.`;

export async function POST(req: Request) {
  // Auth guard — API routes are not covered by middleware
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const parse = RequestSchema.safeParse(await req.json());
  if (!parse.success) return new Response("Bad Request", { status: 400 });

  const { prompt, currentDiagram, projectId } = parse.data;

  const requirementsBlock = projectId ? await fetchRequirementsBlock(supabase, projectId, user.id) : "";

  const systemPrompt = requirementsBlock ? `${requirementsBlock}${BASE_SYSTEM_PROMPT}` : BASE_SYSTEM_PROMPT;

  const userMessage = currentDiagram
    ? `Current diagram:\n${JSON.stringify(currentDiagram, null, 2)}\n\nInstruction: ${prompt}`
    : prompt;

  const { object } = await generateObject({
    model: groq("openai/gpt-oss-120b"),
    system: systemPrompt,
    prompt: userMessage,
    schema: DiagramSchema,
  });

  // Build a position map from both existing and newly generated nodes
  const existingNodes = (currentDiagram?.nodes ?? []) as Array<{ id: string; position: { x: number; y: number } }>;
  const positionMap = new Map<string, { x: number; y: number }>(
    [...existingNodes, ...object.nodes].map((n) => [n.id, n.position]),
  );

  // Deterministically assign handles — don't rely on the LLM to get this right
  const edges = object.edges.map((edge) => {
    const src = positionMap.get(edge.source);
    const tgt = positionMap.get(edge.target);
    if (!src || !tgt) return edge;
    return { ...edge, ...resolveHandles(src, tgt) };
  });

  return Response.json({ ...object, edges });
}
