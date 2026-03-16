import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";

import { fetchFullContext } from "@/lib/ai-context";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

const RequestSchema = z.object({
  messages: z.array(z.unknown()),
  currentDiagram: z
    .object({
      nodes: z.array(z.unknown()).max(100),
      edges: z.array(z.unknown()).max(200),
    })
    .optional(),
  projectId: z.string().uuid().optional(),
});

const SYSTEM_PROMPT = `You are a senior system architecture expert helping engineers design distributed systems.

When asked to design or modify a system, respond with:
1. A brief plain-text explanation of your design choices
2. A JSON code block with the React Flow diagram update

The JSON must follow this exact schema:
\`\`\`json
{
  "nodes": [
    { "id": "string", "type": "service|database|cache|queue|gateway|client|external", "position": { "x": number, "y": number }, "data": { "label": "string", "sublabel": "string (optional)" } }
  ],
  "edges": [
    { "id": "string", "source": "node-id", "target": "node-id" }
  ]
}
\`\`\`

Layout guidelines:
- Clients at top (y: 0), gateways below (y: 120), services in the middle (y: 260), databases/caches at bottom (y: 400)
- Space nodes horizontally with x intervals of 200px
- Edge ids should be "e-{source}-{target}"

Only include NEW nodes/edges that don't already exist in the current diagram. The user will merge them.`;

const MAX_DIAGRAM_NODES = 80;

export async function POST(req: Request) {
  // Auth guard — API routes are not covered by middleware
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const parse = RequestSchema.safeParse(await req.json());
  if (!parse.success) return new Response("Bad Request", { status: 400 });

  const { messages, currentDiagram, projectId } = parse.data;

  // Truncate oversized diagrams to avoid token overflows
  const diagram = currentDiagram
    ? {
        nodes: currentDiagram.nodes.slice(0, MAX_DIAGRAM_NODES),
        edges: currentDiagram.edges.slice(0, MAX_DIAGRAM_NODES * 2),
      }
    : undefined;

  const context = projectId ? await fetchFullContext(supabase, projectId, user.id, "system-design") : "";

  const baseSystem = context ? `${context}${SYSTEM_PROMPT}` : SYSTEM_PROMPT;

  const systemWithContext = diagram
    ? `${baseSystem}\n\nCurrent diagram state:\n\`\`\`json\n${JSON.stringify(diagram, null, 2)}\n\`\`\``
    : baseSystem;

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemWithContext,
    messages: await convertToModelMessages(messages as UIMessage[]),
  });

  return result.toUIMessageStreamResponse();
}
