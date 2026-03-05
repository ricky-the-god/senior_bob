# CLAUDE.md — Senior Architect Mode (DRY, SOLID, KISS)

## 🎯 PROJECT VISION
- **Project:** Ultimate Planner (The Figma of System Design).
- **Goal:** A minimalist, visual-first tool for senior engineers to architect systems and generate AI-ready plans.
- **Priority:** Zero technical debt, extreme maintainability, and high-fidelity UI.

## 🛠 TECH STACK
- **Frontend:** Next.js 15 (App Router), React Flow (Schema Visualizer engine at `/dashboard/canvas/[id]/schema`), Tailwind CSS v4, shadcn/ui.
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

