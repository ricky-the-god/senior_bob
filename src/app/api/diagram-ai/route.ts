import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

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

  const body = (await req.json()) as {
    messages: UIMessage[];
    currentDiagram?: { nodes: unknown[]; edges: unknown[] };
  };

  // Truncate oversized diagrams to avoid token overflows
  const diagram = body.currentDiagram
    ? {
        nodes: body.currentDiagram.nodes.slice(0, MAX_DIAGRAM_NODES),
        edges: body.currentDiagram.edges.slice(0, MAX_DIAGRAM_NODES * 2),
      }
    : undefined;

  const systemWithContext = diagram
    ? `${SYSTEM_PROMPT}\n\nCurrent diagram state:\n\`\`\`json\n${JSON.stringify(diagram, null, 2)}\n\`\`\``
    : SYSTEM_PROMPT;

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: systemWithContext,
    messages: await convertToModelMessages(body.messages),
  });

  return result.toUIMessageStreamResponse();
}
