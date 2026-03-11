import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

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
});

const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(["service", "database", "cache", "queue", "gateway", "client", "external"]),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.object({ label: z.string(), sublabel: z.string().optional() }),
});

const HandleSchema = z.enum(["top", "bottom", "left", "right"]);

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: HandleSchema.optional(),
  targetHandle: HandleSchema.optional(),
});

const DiagramSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

const SYSTEM_PROMPT = `You are a senior system architecture expert. Given a natural language instruction,
generate React Flow nodes and edges to add to or update a system design diagram.

Layout guidelines:
- Clients at top (y: 0), gateways below (y: 120), services in the middle (y: 260), databases/caches at bottom (y: 400)
- Space nodes horizontally with x intervals of 200px
- Edge ids must be "e-{source}-{target}"
- Only output NEW nodes/edges that should be added; do not repeat existing ones.

Edge handle selection — pick sourceHandle and targetHandle based on relative node positions:
- Source ABOVE target (source.y < target.y): sourceHandle="bottom", targetHandle="top"
- Source BELOW target (source.y > target.y): sourceHandle="top", targetHandle="bottom"
- Source LEFT of target (same y, source.x < target.x): sourceHandle="right", targetHandle="left"
- Source RIGHT of target (same y, source.x > target.x): sourceHandle="left", targetHandle="right"
- Diagonal (different x AND y): prefer the axis with the greater distance; use bottom/top for vertical-dominant, right/left for horizontal-dominant.
Always set both sourceHandle and targetHandle. Never leave them empty.`;

export async function POST(req: Request) {
  // Auth guard — API routes are not covered by middleware
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const parse = RequestSchema.safeParse(await req.json());
  if (!parse.success) return new Response("Bad Request", { status: 400 });

  const { prompt, currentDiagram } = parse.data;

  const userMessage = currentDiagram
    ? `Current diagram:\n${JSON.stringify(currentDiagram, null, 2)}\n\nInstruction: ${prompt}`
    : prompt;

  const { object } = await generateObject({
    model: groq("openai/gpt-oss-120b"),
    system: SYSTEM_PROMPT,
    prompt: userMessage,
    schema: DiagramSchema,
  });

  return Response.json(object);
}
