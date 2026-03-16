# CLAUDE.md — Senior Architect Mode (DRY, SOLID, KISS)

## 🎯 PRODUCT VISION
- **Project:** SeniorBob
- **What it is:** A visual-first architecture and planning tool that helps solo entrepreneurs and builders turn app ideas into clear requirements, system designs, and AI-ready implementation context.
- **Core audience:** Solo founders, indie hackers, and small builders who want structure without enterprise complexity.
- **Main product promise:** Help users define what they want to build, generate a visual system design, and produce clean context packs and prompts for Claude Code.
- **Product principle:** Simplicity first. SeniorBob should feel clear, lightweight, and actionable — never like a heavy enterprise planning tool.

## 👤 TARGET USER
The default user is:
- building alone or with a very small team
- has an idea and desired features, but not architecture expertise
- wants guided structure, not blank pages
- needs practical outputs they can drop into a codebase
- values speed, clarity, and maintainability over complexity

When making product or UI decisions, optimize for:
1. clarity
2. speed of understanding
3. guided workflow
4. low cognitive load
5. founder-friendly language

Avoid designing primarily for large teams, PM-heavy workflows, or complex enterprise collaboration unless explicitly requested.

---

## 🧭 CORE USER WORKFLOW
SeniorBob should support this simplified workflow:

1. **Project Setup**
   - project title
   - short description
   - product context

2. **Functional Requirements Discovery**
   - core features
   - user actions
   - workflows
   - entities
   - integrations
   - expected outputs

3. **System Design**
   - visual architecture / diagram
   - major components
   - key flows
   - architecture decisions inferred by SeniorBob

4. **Planning**
   - implementation plan
   - tasks / sprints / milestones

5. **Output Generation**
   - markdown / txt files
   - Claude Code prompts
   - implementation-ready context pack

Every feature should fit naturally into this flow.

---

## 📦 EXPECTED OUTPUTS
SeniorBob is not just a diagramming tool. It must generate clean, structured outputs that users can place directly into their project for Claude Code.

Preferred generated outputs:

- `project-overview.md`
- `requirements.md`
- `system-design.md`
- `architecture-decisions.md`
- `implementation-plan.md`
- `claude-code-architecture-prompt.md`
- `claude-code-task-prompt.md`

### Output rules
- Outputs must be clear, structured, and implementation-oriented
- Outputs must be based on:
  - user functional requirements
  - system design diagram
  - SeniorBob’s inferred architecture decisions
- Outputs must be Claude Code-friendly
- Prefer multiple smaller files over one giant document
- Avoid vague AI prose; write concise, actionable engineering context

---

## 🧠 REQUIREMENTS CAPTURE RULES
SeniorBob should help users clarify **functional requirements only**.

### Users should provide
- what the product does
- who uses it
- key user actions
- core workflows
- major entities/data concepts
- external integrations
- desired outputs
- obvious constraints they already know

### SeniorBob should infer
- architecture style
- complexity level
- sync vs async behavior
- storage/data patterns
- security baseline
- scalability assumptions
- maintainability tradeoffs
- implementation sequencing

### Interview behavior
When building requirements flows:
- prefer guided questioning
- prefer multiple-choice / structured answers where possible
- allow text input when nuance is required
- do not ask users for advanced non-functional requirements
- ask one useful group of functional questions at a time
- summarize findings clearly before moving forward

---

## 🧱 SYSTEM DESIGN RULES
System design should be useful, not performative.

### Default approach
- optimize for pragmatic architectures
- favor modular monoliths unless requirements justify more
- do not push microservices, queues, or infra complexity unless needed
- always consider solo-founder maintainability

### Agent responsibility
SeniorBob should decide reasonable architecture defaults based on the functional requirements.

This includes inferring:
- whether a queue is necessary
- whether background jobs are needed
- what kind of storage model fits
- whether auth/roles are simple or advanced
- whether the product needs lightweight or more structured architecture

### Diagram purpose
The diagram is not the final product.
It is one input into:
- implementation planning
- architecture reasoning
- output generation
- Claude Code context

## 🛠 TECH STACK
- **Frontend:** Next.js 15 (App Router), React Flow (Schema Visualizer engine at `/dashboard/project/[id]/overview`), Tailwind CSS v4, shadcn/ui.
- **Backend:** Supabase (Auth, RLS, PostgreSQL).
- **AI Integration:** Vercel AI SDK (Anthropic Provider).

## 🧩 ARCHITECTURAL GUIDELINES (DRY / SOLID / KISS)
- **S - Single Responsibility:** One component, one job. Separate business logic (Server Actions/Hooks) from UI (Client Components).
- **O/D - Dependency Inversion:** Program to interfaces. Define TypeScript schemas before implementation.
- **DRY (Don't Repeat Yourself):** Abstract logic into custom hooks (e.g., `useCanvas`) or utility functions only when patterns repeat.
- **KISS (Keep It Simple, Stupid):** Avoid over-engineering. Do not add state management (Zustand) if local state or URL params suffice.
- **YAGNI (You Ain't Gonna Need It):** Only implement features defined in the current sprint. No placeholder code.

## 💻 WORKFLOW & COMMANDS
- **Dev:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Visual Testing:** Always use **Playwright MCP** via `npx playwright test` after rendering.
- **Docs:** Use **Context7 MCP** to fetch official documentation.

## 📏 CODING STANDARDS
1. **TypeScript:** Strict mode. Zero `any`. Define `type` or `interface` for all data structures.
2. **Components:** Functional components using `const`. No class components.
3. **Styling:** Follow a "Linear-style" aesthetic: Dark mode by default, high contrast, minimalist borders, and subtle glows.
4. **Error Handling:** Use Zod for input validation. Implement graceful degradation with Error Boundaries.
5. **Naming:** `camelCase` for variables/functions, `PascalCase` for components/types, `kebab-case` for folders/files.

## 🤖 AGENTIC BEHAVIOR
- **Plan First:** Before writing code, output a 3-5 step plan in the terminal and wait for user acknowledgment.
- **Vision Loop:** For UI tasks, use Playwright to take a screenshot, compare it against the "Senior Design Principles" in the README, and self-correct if it looks "cheap" or "junior."
- **Reference Search:** If an API is ambiguous, run `context7 search [query]` to avoid hallucinations.

