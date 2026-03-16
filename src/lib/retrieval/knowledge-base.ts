import type { AppTypeId } from "@/lib/project-types";

import type { RetrievalSignals } from "./classify";

export type KnowledgeCategory =
  | "archetype"
  | "pattern"
  | "diagram-framework"
  | "security"
  | "documentation-template"
  | "api-template"
  | "cloud-reference";

export type KnowledgePhase = "guided-setup" | "system-design" | "output-pack";

export type KnowledgeEntry = {
  id: string;
  category: KnowledgeCategory;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  whenToUse: string;
  avoidWhen?: string;
  phases: KnowledgePhase[];
  appTypes?: AppTypeId[];
  signals?: (keyof RetrievalSignals)[];
  provider?: string;
  source?: string;
};

// ─── Query helper ─────────────────────────────────────────────────────────────

export function queryKnowledge(signals: RetrievalSignals, phase: KnowledgePhase): KnowledgeEntry[] {
  return KNOWLEDGE_BASE.filter((entry) => {
    if (!entry.phases.includes(phase)) return false;
    if (entry.appTypes) {
      if (!signals.appType || !entry.appTypes.includes(signals.appType)) return false;
    }
    if (entry.signals) {
      return entry.signals.some((k) => Boolean(signals[k]));
    }
    return true;
  });
}

// ─── Knowledge Base ───────────────────────────────────────────────────────────

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ── Group A — Diagram / Modeling ────────────────────────────────────────────

  {
    id: "diagram-c4-overview",
    category: "diagram-framework",
    title: "C4 Model Overview",
    summary: "Four-level hierarchy for describing software architecture: Context, Container, Component, Code.",
    content: `Use the C4 model to describe architecture at four levels of detail:
- **Level 1 — System Context:** Your system + external users + external systems it depends on.
- **Level 2 — Container:** Deployable units (web app, API, database, mobile app, background worker).
- **Level 3 — Component:** Major structural building blocks inside a container.
- **Level 4 — Code:** Class/function level — only for the most critical components.

For solo founders, start at Level 2 (Container). Level 1 is useful for client-facing docs.`,
    tags: ["c4", "diagram", "architecture", "modeling"],
    whenToUse: "When generating any system design diagram or explaining architecture structure.",
    phases: ["system-design"],
    source: "https://c4model.com",
  },

  {
    id: "diagram-structurizr-dsl",
    category: "diagram-framework",
    title: "Structurizr DSL Patterns",
    summary: "Starter DSL patterns for workspace, system, and container definitions in Structurizr.",
    content: `\`\`\`
workspace {
  model {
    user = person "User"
    system = softwareSystem "Your App" {
      webapp = container "Web App" { technology "Next.js" }
      api = container "API" { technology "Node.js" }
      db = container "Database" { technology "PostgreSQL" }
    }
    user -> webapp "Uses"
    webapp -> api "Calls"
    api -> db "Reads/writes"
  }
  views {
    systemContext system "SystemContext"
    container system "Containers"
  }
}
\`\`\`
Adapt this skeleton to fit the actual components in the project.`,
    tags: ["structurizr", "dsl", "diagram", "c4"],
    whenToUse: "When producing exportable architecture diagrams from text descriptions.",
    phases: ["system-design"],
    source: "https://structurizr.com/dsl",
  },

  // ── Group B — Architecture Archetypes (hints — Phase 1) ─────────────────────

  {
    id: "archetype-saas-hint",
    category: "archetype",
    title: "App Type Hint (saas)",
    summary: "Guided-setup focus areas for SaaS platform projects.",
    content: "Focus on subscription model, multi-tenancy, user roles, and plan-based feature gating.",
    tags: ["saas", "multi-tenancy", "subscription"],
    whenToUse: "When appType is saas during guided setup questioning.",
    phases: ["guided-setup"],
    appTypes: ["saas"],
  },

  {
    id: "archetype-mobile-hint",
    category: "archetype",
    title: "App Type Hint (mobile)",
    summary: "Guided-setup focus areas for mobile app projects.",
    content: "Focus on offline behavior, push notifications, local state sync, and native device APIs.",
    tags: ["mobile", "offline", "push-notifications"],
    whenToUse: "When appType is mobile during guided setup questioning.",
    phases: ["guided-setup"],
    appTypes: ["mobile"],
  },

  {
    id: "archetype-api-hint",
    category: "archetype",
    title: "App Type Hint (api)",
    summary: "Guided-setup focus areas for API platform projects.",
    content: "Focus on authentication, rate limiting, versioning, and SDK-friendly response shapes.",
    tags: ["api", "versioning", "rate-limiting"],
    whenToUse: "When appType is api during guided setup questioning.",
    phases: ["guided-setup"],
    appTypes: ["api"],
  },

  {
    id: "archetype-ecommerce-hint",
    category: "archetype",
    title: "App Type Hint (ecommerce)",
    summary: "Guided-setup focus areas for e-commerce projects.",
    content: "Focus on cart, checkout, inventory management, and fulfillment workflows.",
    tags: ["ecommerce", "cart", "checkout", "inventory"],
    whenToUse: "When appType is ecommerce during guided setup questioning.",
    phases: ["guided-setup"],
    appTypes: ["ecommerce"],
  },

  {
    id: "archetype-realtime-hint",
    category: "archetype",
    title: "App Type Hint (realtime)",
    summary: "Guided-setup focus areas for real-time app projects.",
    content: "Focus on WebSocket connections, presence indicators, and conflict resolution.",
    tags: ["realtime", "websocket", "presence"],
    whenToUse: "When appType is realtime during guided setup questioning.",
    phases: ["guided-setup"],
    appTypes: ["realtime"],
  },

  {
    id: "archetype-internal-hint",
    category: "archetype",
    title: "App Type Hint (internal)",
    summary: "Guided-setup focus areas for internal tool projects.",
    content: "Focus on RBAC, audit logs, and integration with existing internal systems.",
    tags: ["internal", "rbac", "audit"],
    whenToUse: "When appType is internal during guided setup questioning.",
    phases: ["guided-setup"],
    appTypes: ["internal"],
  },

  {
    id: "archetype-data-pipeline-hint",
    category: "archetype",
    title: "App Type Hint (data-pipeline)",
    summary: "Guided-setup focus areas for data pipeline projects.",
    content: "Focus on ingestion sources, transformation steps, scheduling, and output sinks.",
    tags: ["data-pipeline", "etl", "ingestion"],
    whenToUse: "When appType is data-pipeline during guided setup questioning.",
    phases: ["guided-setup"],
    appTypes: ["data-pipeline"],
  },

  {
    id: "archetype-microservices-hint",
    category: "archetype",
    title: "App Type Hint (microservices)",
    summary: "Guided-setup focus areas for microservices projects.",
    content: "Focus on service boundaries, inter-service contracts, and independent deployability.",
    tags: ["microservices", "service-boundaries", "contracts"],
    whenToUse: "When appType is microservices during guided setup questioning.",
    phases: ["guided-setup"],
    appTypes: ["microservices"],
  },

  // ── Group B — Architecture Archetypes (patterns — Phase 2) ──────────────────

  {
    id: "archetype-saas-pattern",
    category: "archetype",
    title: "Architecture Pattern — SaaS",
    summary: "Multi-tenant SaaS architecture rules covering auth, billing, and background jobs.",
    content: `- Auth layer → tenant-scoped DB queries (row-level or schema-per-tenant)
- Subscription gate middleware before premium features
- Background jobs for billing sync, email, and report generation
- Admin panel isolated from tenant-facing app`,
    tags: ["saas", "multi-tenancy", "subscription", "billing"],
    whenToUse: "When appType is saas during system design.",
    phases: ["system-design"],
    appTypes: ["saas"],
  },

  {
    id: "archetype-api-pattern",
    category: "archetype",
    title: "Architecture Pattern — API Platform",
    summary: "API platform architecture rules covering versioning, auth, rate limiting, and error envelopes.",
    content: `- Versioned route prefix (e.g. /v1/, /v2/) from day one
- Auth middleware (API key or OAuth2) before all handlers
- Rate limiter per key/IP at the gateway layer
- Structured error envelope: \`{ error: { code, message, details } }\``,
    tags: ["api", "versioning", "rate-limiting", "auth"],
    whenToUse: "When appType is api during system design.",
    phases: ["system-design"],
    appTypes: ["api"],
  },

  {
    id: "archetype-realtime-pattern",
    category: "archetype",
    title: "Architecture Pattern — Real-time App",
    summary: "Real-time app architecture covering WebSocket gateway, presence, optimistic UI, and HTTP fallback.",
    content: `- WebSocket gateway as the entry point for live channels
- Presence layer with heartbeat / TTL-based eviction
- Optimistic UI updates client-side; reconcile on reconnect
- Separate HTTP API for non-real-time reads`,
    tags: ["realtime", "websocket", "presence", "optimistic-ui"],
    whenToUse: "When appType is realtime during system design.",
    phases: ["system-design"],
    appTypes: ["realtime"],
  },

  {
    id: "archetype-ecommerce-pattern",
    category: "archetype",
    title: "Architecture Pattern — E-commerce",
    summary:
      "E-commerce architecture covering cart isolation, checkout state machine, inventory reservation, and webhook fulfillment.",
    content: `- Cart service isolated from inventory (eventual consistency acceptable)
- Checkout as a state machine: pending → paid → fulfilling → shipped
- Inventory reservation lock during checkout window
- Webhook-driven fulfillment triggers after payment confirmation`,
    tags: ["ecommerce", "cart", "checkout", "inventory", "state-machine"],
    whenToUse: "When appType is ecommerce during system design.",
    phases: ["system-design"],
    appTypes: ["ecommerce"],
  },

  {
    id: "archetype-data-pipeline-pattern",
    category: "archetype",
    title: "Architecture Pattern — Data Pipeline",
    summary:
      "Data pipeline architecture covering ingestion, idempotent processing, dead-letter queue, and read models.",
    content: `- Ingestion → validation → transformation → storage → serving
- Idempotent processing at each stage (replay-safe)
- Dead-letter queue for failed records
- Separate read model / materialized view for serving layer`,
    tags: ["data-pipeline", "etl", "idempotent", "dlq"],
    whenToUse: "When appType is data-pipeline during system design.",
    phases: ["system-design"],
    appTypes: ["data-pipeline"],
  },

  {
    id: "archetype-internal-pattern",
    category: "archetype",
    title: "Architecture Pattern — Internal Tool",
    summary: "Internal tool architecture covering RBAC, audit logs, data import/export, and simplified UI.",
    content: `- RBAC with explicit role definitions (viewer / editor / admin)
- Audit log on all write operations (who, what, when)
- Import/export adapters for existing data sources
- Keep UI simple — these users are power users, not casual visitors`,
    tags: ["internal", "rbac", "audit-log", "import-export"],
    whenToUse: "When appType is internal during system design.",
    phases: ["system-design"],
    appTypes: ["internal"],
  },

  {
    id: "archetype-mobile-pattern",
    category: "archetype",
    title: "Architecture Pattern — Mobile App",
    summary: "Mobile app architecture covering offline-first sync, push notification abstraction, and token refresh.",
    content: `- Offline-first: local SQLite/IndexedDB write → sync on reconnect
- Push notification service isolated behind an abstraction
- Separate API for mobile vs web if payloads differ significantly
- Token refresh handled transparently by a client-side interceptor`,
    tags: ["mobile", "offline-first", "push-notifications", "sync"],
    whenToUse: "When appType is mobile during system design.",
    phases: ["system-design"],
    appTypes: ["mobile"],
  },

  {
    id: "archetype-microservices-pattern",
    category: "archetype",
    title: "Architecture Pattern — Microservices",
    summary: "Microservices architecture covering data ownership, async messaging, sync contracts, and API gateway.",
    content: `- Each service owns its data store (no cross-service DB joins)
- Async messaging for non-critical cross-service events
- Synchronous HTTP/gRPC only when a response is required inline
- API gateway as the single entry point for all clients`,
    tags: ["microservices", "service-boundaries", "async-messaging", "api-gateway"],
    whenToUse: "When appType is microservices during system design.",
    phases: ["system-design"],
    appTypes: ["microservices"],
  },

  // ── Group C — Cross-Cutting Patterns ────────────────────────────────────────

  {
    id: "pattern-modular-monolith",
    category: "pattern",
    title: "Simplicity Rule",
    summary: "Default to a modular monolith; reject premature service decomposition.",
    content:
      "Default to a modular monolith. Do NOT propose microservices, separate queues, or additional services unless the user explicitly requires independent scaling or team isolation. Complexity must be justified.",
    tags: ["monolith", "simplicity", "architecture-default"],
    whenToUse:
      "When biasMonolith signal is true — i.e. the project is not explicitly microservices or container-based infra.",
    phases: ["system-design"],
    signals: ["biasMonolith"],
  },

  {
    id: "pattern-ai-probing",
    category: "pattern",
    title: "AI App Probing",
    summary: "Guided-setup questions to ask when the project involves AI/LLM features.",
    content:
      "Probe for: model provider preference, streaming vs batch responses, context window needs, and fallback behavior when the model is unavailable.",
    tags: ["ai", "llm", "probing", "guided-setup"],
    whenToUse: "When isAiApp signal is true during guided setup.",
    phases: ["guided-setup"],
    signals: ["isAiApp"],
  },

  {
    id: "pattern-ai-baseline",
    category: "pattern",
    title: "AI App Baseline",
    summary:
      "Core architectural components required for LLM-driven features: gateway, prompt store, streaming, and fallback.",
    content:
      "Include: LLM gateway component, prompt template store, streaming response handler, and fallback/retry logic with exponential backoff. Model provider should be swappable.",
    tags: ["ai", "llm", "streaming", "gateway", "fallback"],
    whenToUse: "When isAiApp signal is true during system design.",
    phases: ["system-design"],
    signals: ["isAiApp"],
  },

  {
    id: "pattern-auth-rbac",
    category: "pattern",
    title: "Auth Guardrail",
    summary: "Auth must-haves: session management, CSRF, OAuth hardening, and token rotation.",
    content:
      "Auth must include: session management, CSRF protection, OAuth callback hardening, and token rotation on privilege change. Never store raw tokens in localStorage.",
    tags: ["auth", "session", "csrf", "oauth", "token"],
    whenToUse: "When hasAuth signal is true.",
    phases: ["system-design"],
    signals: ["hasAuth"],
  },

  {
    id: "pattern-payment-security",
    category: "pattern",
    title: "Payment Security",
    summary: "Payment flow must-haves: webhook signature validation, idempotency keys, and PCI scope isolation.",
    content:
      "Payment flow must include: webhook signature validation (reject unsigned events), idempotency keys on all charge/refund calls, and PCI-scoped components isolated from the rest of the app.",
    tags: ["payments", "stripe", "webhook", "idempotency", "pci"],
    whenToUse: "When hasPayments signal is true.",
    phases: ["system-design"],
    signals: ["hasPayments"],
  },

  {
    id: "pattern-payments-probing",
    category: "pattern",
    title: "Payments Probing",
    summary: "Guided-setup questions to ask when the project involves payments.",
    content: "Probe for: subscription vs one-time purchase, trial period, refunds policy, and invoice / receipt needs.",
    tags: ["payments", "subscription", "billing", "probing"],
    whenToUse: "When hasPayments signal is true during guided setup.",
    phases: ["guided-setup"],
    signals: ["hasPayments"],
  },

  {
    id: "pattern-file-upload",
    category: "pattern",
    title: "File Upload Pattern",
    summary: "File upload via presigned URLs with type/size validation and virus scan hook.",
    content:
      "File upload must use the presigned URL pattern — never route file bytes through your server. Include: file type validation (allowlist), size limit enforcement, and a virus scan hook before marking a file as usable.",
    tags: ["file-upload", "presigned-url", "storage", "security"],
    whenToUse: "When hasFileUpload signal is true.",
    phases: ["system-design"],
    signals: ["hasFileUpload"],
  },

  {
    id: "pattern-notifications",
    category: "pattern",
    title: "Notification Delivery Pattern",
    summary: "Background job pattern for reliable email, push, and in-app alert delivery.",
    content: `Deliver notifications via a background job, not inline in the request handler:
- Enqueue a job immediately on the triggering event
- Worker processes: email (transactional provider), push (APNs/FCM), in-app alerts (DB + WebSocket)
- Retry with exponential backoff on delivery failure
- Track delivery status per channel for observability`,
    tags: ["notifications", "email", "push", "background-job", "async"],
    whenToUse:
      "When the project requires email, push, or in-app notification delivery (saas, ecommerce, mobile, internal).",
    phases: ["system-design"],
    appTypes: ["saas", "ecommerce", "mobile", "internal"],
  },

  {
    id: "pattern-existing-codebase",
    category: "pattern",
    title: "Existing Codebase",
    summary: "Guidance for adding to an existing codebase rather than building greenfield.",
    content:
      "User is adding to an existing codebase. Focus on integration points, migration paths, and backward-compatibility — not greenfield design.",
    tags: ["existing-codebase", "migration", "integration", "backward-compatibility"],
    whenToUse: "When isExistingCodebase signal is true (user indicated this is not a new app).",
    phases: ["guided-setup"],
    signals: ["isExistingCodebase"],
  },

  // ── Group D — Security Guardrails ────────────────────────────────────────────

  {
    id: "security-auth-baseline",
    category: "security",
    title: "Auth Security Baseline",
    summary: "Auth must-haves: no raw tokens in localStorage, PKCE for OAuth, session expiry.",
    content: `- Never store raw access tokens in localStorage — use httpOnly cookies or a BFF pattern
- Use PKCE for all OAuth 2.0 flows
- Set session expiry and implement silent refresh before expiry
- Invalidate all sessions on password change or privilege elevation
- Rotate refresh tokens on use (refresh token rotation)`,
    tags: ["auth", "security", "pkce", "session", "token-rotation"],
    whenToUse: "Always include when auth is present in the design.",
    phases: ["system-design"],
    signals: ["hasAuth"],
  },

  {
    id: "security-api-baseline",
    category: "security",
    title: "API Security Baseline",
    summary:
      "API must-haves: rate limiting, auth on every route, structured error envelope, no stack traces in production.",
    content: `- Every route must verify auth before processing — no public routes by accident
- Rate limit per authenticated user and per IP (separate limits)
- Return structured error envelopes: \`{ error: { code, message } }\` — never expose stack traces
- Validate and sanitize all inputs at the boundary (use Zod or equivalent)
- Set security headers: HSTS, CSP, X-Content-Type-Options, X-Frame-Options`,
    tags: ["api", "security", "rate-limiting", "error-handling", "headers"],
    whenToUse: "Always include for any project with an HTTP API.",
    phases: ["system-design"],
  },

  {
    id: "security-secret-handling",
    category: "security",
    title: "Secret Handling",
    summary: "Env vars, never commit secrets, rotation strategy, server-only access.",
    content: `- All secrets in environment variables — never hardcoded, never committed
- Separate .env files per environment (local, staging, production)
- Server-side secrets (API keys, DB passwords) must never be accessible client-side
- Rotate secrets on suspected compromise; document rotation steps in runbook
- Use a secret manager (e.g. Vercel env, Doppler, AWS Secrets Manager) for production`,
    tags: ["secrets", "env-vars", "security", "rotation"],
    whenToUse: "Always include in any project with external API keys or database credentials.",
    phases: ["system-design"],
  },

  // ── Group E — Documentation Templates ───────────────────────────────────────

  {
    id: "doc-adr-template",
    category: "documentation-template",
    title: "ADR Format",
    summary: "Architecture Decision Record format: Status, Context, Decision, Consequences.",
    content: `Use this structure for every architecture decision record:
\`\`\`
## ADR-NNN: [Decision Title]
**Status:** Accepted
**Context:** [What problem does this decision address?]
**Decision:** [What was decided?]
**Consequences:** [What are the tradeoffs?]
\`\`\``,
    tags: ["adr", "documentation", "architecture-decision"],
    whenToUse: "When generating architecture-decisions.md output.",
    phases: ["output-pack"],
  },

  {
    id: "doc-output-file-names",
    category: "documentation-template",
    title: "Output File Naming Convention",
    summary: "Canonical set and order of output files generated by SeniorBob.",
    content: `Generate exactly these files in this order:
1. project-overview.md
2. requirements.md
3. architecture-decisions.md
4. claude-code-architecture-prompt.md
5. claude-code-task-prompt.md`,
    tags: ["output", "file-naming", "documentation"],
    whenToUse: "When generating an output pack — defines which files to produce and their order.",
    phases: ["output-pack"],
  },

  {
    id: "doc-claude-code-prompt",
    category: "documentation-template",
    title: "Claude Code Prompt Structure",
    summary: "Structure for claude-code-architecture-prompt.md: project context, task, files, and anti-patterns.",
    content: `claude-code-architecture-prompt.md must follow this structure:
- "You are working on [project name], a [type] built with [stack]."
- "Your task: [specific task]"
- "Context: [relevant files, data models, constraints]"
- "Do not: [anti-patterns to avoid]"`,
    tags: ["claude-code", "prompt", "documentation", "context"],
    whenToUse: "When generating claude-code-architecture-prompt.md.",
    phases: ["output-pack"],
  },

  {
    id: "doc-requirements-template",
    category: "documentation-template",
    title: "Requirements Capture Outline",
    summary: "arc42-inspired requirements capture structure for requirements.md.",
    content: `requirements.md should cover:
1. **Goals** — What success looks like for the user
2. **Stakeholders** — Who uses the system and what they need
3. **Functional Requirements** — Features and user actions (numbered list)
4. **Key Workflows** — Step-by-step flows for the most important user journeys
5. **Data Entities** — Core domain objects and their relationships
6. **External Integrations** — Third-party APIs and services
7. **Constraints** — Known technical, time, or budget limits`,
    tags: ["requirements", "arc42", "documentation", "functional"],
    whenToUse: "When generating requirements.md output.",
    phases: ["output-pack"],
  },

  {
    id: "doc-ai-app-adr",
    category: "documentation-template",
    title: "AI App ADR",
    summary: "ADR template for documenting LLM provider choice, context strategy, and fallback behavior.",
    content: `Include an ADR documenting: model provider choice and rationale, context strategy (system prompt vs message history), streaming vs batch decision, and fallback behavior.`,
    tags: ["adr", "ai", "llm", "documentation"],
    whenToUse: "When isAiApp and generating output pack — documents the AI architecture decision.",
    phases: ["output-pack"],
    signals: ["isAiApp"],
  },

  {
    id: "doc-payment-adr",
    category: "documentation-template",
    title: "Payment ADR",
    summary: "ADR template for documenting payment provider choice, webhook strategy, and PCI scope.",
    content: `Include an ADR documenting: payment provider choice and rationale, webhook strategy (signature validation, retry handling), and PCI scope boundary definition.`,
    tags: ["adr", "payments", "stripe", "documentation"],
    whenToUse: "When hasPayments and generating output pack — documents the payment architecture decision.",
    phases: ["output-pack"],
    signals: ["hasPayments"],
  },

  // ── Group F — API / Contract Guidance ────────────────────────────────────────

  {
    id: "api-openapi-starter",
    category: "api-template",
    title: "OpenAPI 3.1 Skeleton",
    summary: "OpenAPI 3.1 document skeleton covering info, servers, paths, and components.",
    content: `\`\`\`yaml
openapi: "3.1.0"
info:
  title: "[Project Name] API"
  version: "1.0.0"
servers:
  - url: "https://api.example.com/v1"
paths:
  /resources:
    get:
      summary: "List resources"
      responses:
        "200":
          description: "OK"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ResourceList"
components:
  schemas:
    ResourceList:
      type: array
      items:
        $ref: "#/components/schemas/Resource"
\`\`\``,
    tags: ["openapi", "api", "contract", "schema"],
    whenToUse: "When the project has a public or partner-facing HTTP API and needs a contract definition.",
    phases: ["system-design"],
  },

  {
    id: "api-crud-conventions",
    category: "api-template",
    title: "REST CRUD Conventions",
    summary: "Standard HTTP method, path, and status code conventions for CRUD operations.",
    content: `| Operation | Method | Path              | Success Status |
|-----------|--------|-------------------|----------------|
| List      | GET    | /resources        | 200            |
| Create    | POST   | /resources        | 201            |
| Read      | GET    | /resources/:id    | 200            |
| Update    | PUT    | /resources/:id    | 200            |
| Patch     | PATCH  | /resources/:id    | 200            |
| Delete    | DELETE | /resources/:id    | 204            |

- Use 404 for not found, 422 for validation errors, 401 for unauthenticated, 403 for unauthorized.
- Always wrap list responses in an object: \`{ data: [], meta: { total, page } }\``,
    tags: ["rest", "crud", "api", "conventions", "http"],
    whenToUse: "When designing REST API endpoints for any project with a backend API.",
    phases: ["system-design"],
  },

  {
    id: "api-webhook-patterns",
    category: "api-template",
    title: "Webhook Delivery Patterns",
    summary: "Webhook best practices: signature validation, idempotency, and retry envelope.",
    content: `- Validate webhook signatures on every incoming request (HMAC-SHA256 over raw body)
- Return 200 immediately after signature check — process async in a background job
- Make handlers idempotent (use event ID as idempotency key)
- Retry envelope: exponential backoff, max 5 attempts, dead-letter after final failure
- Log all received events with timestamp, event type, and processing status`,
    tags: ["webhook", "signature", "idempotency", "retry", "async"],
    whenToUse: "When the project sends or receives webhooks (payments, third-party events, etc.).",
    phases: ["system-design"],
  },

  // ── Group G — Cloud / Deployment References ──────────────────────────────────

  {
    id: "cloud-vercel-supabase",
    category: "cloud-reference",
    title: "Vercel + Supabase Deployment Pattern",
    summary: "Simplicity-first deployment stack for Next.js + Supabase projects.",
    content: `Recommended stack for solo founders and small teams:
- **Hosting:** Vercel (zero-config Next.js deploy, edge functions, preview URLs)
- **Database + Auth:** Supabase (Postgres, Row Level Security, built-in auth, storage)
- **Env vars:** Vercel dashboard → project settings → environment variables
- **Preview environments:** Supabase branch databases pair with Vercel preview deployments
- **Scaling:** This stack handles tens of thousands of users with zero infrastructure ops`,
    tags: ["vercel", "supabase", "deployment", "next.js", "hosting"],
    whenToUse: "When the project uses Next.js and Supabase — the default SeniorBob stack.",
    phases: ["system-design"],
    provider: "Vercel/Supabase",
  },

  {
    id: "cloud-ai-provider",
    category: "cloud-reference",
    title: "AI Model Provider Selection",
    summary: "Tradeoffs between Anthropic, Groq, and OpenAI for LLM integration.",
    content: `Provider tradeoffs for LLM-driven features:
- **Anthropic (Claude):** Best for reasoning, long context, and instruction-following. Use for complex generation tasks. Higher cost per token.
- **Groq:** Fastest inference (LPU hardware), lowest latency. Best for real-time chat or streaming UIs. Llama and Mixtral models.
- **OpenAI (GPT-4o):** Widest ecosystem, best function-calling support. Good default if team has existing OpenAI experience.

Recommendation: use Anthropic for generation-heavy tasks (output packs, architecture), Groq for low-latency chat. Abstract behind a provider interface so you can swap without rewriting callers.`,
    tags: ["ai", "llm", "anthropic", "groq", "openai", "provider"],
    whenToUse: "When isAiApp is true and the system design includes an LLM component.",
    phases: ["system-design"],
    signals: ["isAiApp"],
    provider: "Anthropic/Groq/OpenAI",
  },
];
