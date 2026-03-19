"use client";

import { useEffect, useId, useState } from "react";

import { motion } from "framer-motion";

// ─── Shared types & constants ────────────────────────────────────────────────

type NodeType = "service" | "database" | "gateway" | "client";

interface MiniNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
}

interface MiniEdge {
  from: string;
  to: string;
}

const miniNodes: MiniNode[] = [
  { id: "client", label: "Client", type: "client", x: 20, y: 20 },
  { id: "gateway", label: "API Gateway", type: "gateway", x: 160, y: 20 },
  { id: "service", label: "App Service", type: "service", x: 160, y: 120 },
  { id: "db", label: "PostgreSQL", type: "database", x: 160, y: 220 },
];

const miniEdges: MiniEdge[] = [
  { from: "client", to: "gateway" },
  { from: "gateway", to: "service" },
  { from: "service", to: "db" },
];

const miniNodeColors: Record<NodeType, string> = {
  client: "from-sky-500/20 to-sky-600/10 border-sky-500/30",
  gateway: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
  service: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  database: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
};

const miniNodeIconPaths: Record<NodeType, string> = {
  client:
    "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3",
  gateway: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
  service: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9",
  database:
    "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75",
};

const NODE_W = 110;
const NODE_H = 28;

const getMiniCenter = (node: MiniNode) => ({
  x: node.x + NODE_W / 2,
  y: node.y + NODE_H / 2,
});

// ─── Visual Mock: Guided Setup (Chat) ────────────────────────────────────────

const chatMessages = [
  { from: "bob", text: "What type of product are you building?" },
  { from: "user", text: "A SaaS tool for solo founders" },
  { from: "bob", text: "Who are your core users and what's their main goal?" },
];

const answerChips = ["Indie hackers", "Small startups", "Freelancers"];

const GuidedSetupMock = () => {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= chatMessages.length) return;
    const t = setTimeout(() => setVisible((v) => v + 1), 700);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="mb-1 flex items-center gap-2">
        <div className="flex size-5 items-center justify-center rounded-full bg-primary/20">
          <span className="font-mono-tight text-[9px] text-primary">SB</span>
        </div>
        <span className="font-mono-tight text-[10px] text-zinc-950/40 dark:text-zinc-50/40">Guided Setup</span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 overflow-hidden">
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} transition-all duration-500`}
            style={{
              opacity: i < visible ? 1 : 0,
              transform: i < visible ? "translateY(0)" : "translateY(6px)",
            }}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                msg.from === "bob"
                  ? "border border-primary/20 bg-primary/8 text-zinc-950/80 dark:text-zinc-50/80"
                  : "border border-zinc-950/10 bg-zinc-950/5 text-zinc-950/60 dark:border-zinc-50/10 dark:bg-zinc-50/5 dark:text-zinc-50/60"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div
        className="flex flex-wrap gap-1.5 pt-1"
        style={{
          opacity: visible >= chatMessages.length ? 1 : 0,
          transition: "opacity 400ms",
          transitionDelay: "200ms",
        }}
      >
        {answerChips.map((chip) => (
          <button
            key={chip}
            type="button"
            className="cursor-default rounded-full border border-primary/25 bg-primary/8 px-2.5 py-1 font-mono-tight text-[10px] text-primary/80 transition-colors hover:bg-primary/15"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Visual Mock: System Design Generator (Node Graph) ───────────────────────

const SystemDesignMock = () => {
  const uid = useId();
  const activeGradId = `${uid}-active`;
  const dimGradId = `${uid}-dim`;
  const [activeEdge, setActiveEdge] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setActiveEdge((p) => (p + 1) % miniEdges.length), 1600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-full flex-col p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-mono-tight text-[10px] text-zinc-950/40 dark:text-zinc-50/40">System Design Canvas</span>
        <span className="ml-auto rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono-tight text-[9px] text-emerald-600 dark:text-emerald-400">
          AI generated
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-lg border border-zinc-950/8 bg-[radial-gradient(circle_at_center,_theme(colors.zinc.950/3)_1px,_transparent_1px)] bg-[size:16px_16px] dark:border-zinc-50/8 dark:bg-[radial-gradient(circle_at_center,_theme(colors.zinc.50/3)_1px,_transparent_1px)]">
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id={activeGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.75 0.15 75 / 0.9)" />
              <stop offset="100%" stopColor="oklch(0.75 0.15 75 / 0.4)" />
            </linearGradient>
            <linearGradient id={dimGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.75 0.15 75 / 0.2)" />
              <stop offset="100%" stopColor="oklch(0.75 0.15 75 / 0.07)" />
            </linearGradient>
          </defs>
          {miniEdges.map((edge, idx) => {
            const fn = miniNodes.find((n) => n.id === edge.from);
            const tn = miniNodes.find((n) => n.id === edge.to);
            if (!fn || !tn) return null;
            const f = getMiniCenter(fn);
            const t = getMiniCenter(tn);
            const isActive = idx === activeEdge;
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={f.x + 24}
                  y1={f.y + 24}
                  x2={t.x + 24}
                  y2={t.y + 24}
                  stroke={isActive ? `url(#${activeGradId})` : `url(#${dimGradId})`}
                  strokeWidth={isActive ? 2 : 1}
                  className="transition-all duration-500"
                />
                {isActive && (
                  <circle r="3" fill="oklch(0.75 0.15 75)">
                    <animateMotion
                      dur="0.8s"
                      repeatCount="1"
                      path={`M${f.x + 24},${f.y + 24} L${t.x + 24},${t.y + 24}`}
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {miniNodes.map((node, idx) => (
          <div
            key={node.id}
            className={`absolute flex items-center gap-1.5 rounded-lg border bg-gradient-to-br px-2 py-1.5 shadow-md ${miniNodeColors[node.type]}`}
            style={{
              left: node.x + 24,
              top: node.y + 24,
              minWidth: `${NODE_W}px`,
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(8px)",
              transition: "all 400ms",
              transitionDelay: `${idx * 90}ms`,
            }}
          >
            <svg
              aria-hidden="true"
              className="size-3 shrink-0 text-zinc-950/70 dark:text-zinc-50/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={miniNodeIconPaths[node.type]} />
            </svg>
            <span className="font-mono-tight text-[10px] text-zinc-950/80 dark:text-zinc-50/80">{node.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Visual Mock: Output Pack (File List) ────────────────────────────────────

const outputFiles = [
  {
    name: "requirements.md",
    desc: "Functional requirements, entities, workflows",
    color: "text-sky-600 dark:text-sky-400",
    icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  },
  {
    name: "system-design.md",
    desc: "Architecture diagram, components, key flows",
    color: "text-amber-600 dark:text-amber-400",
    icon: "M3.75 3.75v4.5m0-4.5h4.5m9.75 0v4.5m0-4.5h-4.5m-9.75 15v-4.5m0 4.5h4.5m9.75 0v-4.5m0 4.5h-4.5M12 12h.008v.008H12V12zm0-3h.008v.008H12V9zm0 6h.008v.008H12v-.008z",
  },
  {
    name: "claude-code-architecture-prompt.md",
    desc: "Drop-in prompt for Claude Code implementation",
    color: "text-primary dark:text-primary",
    icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  },
  {
    name: "implementation-plan.md",
    desc: "Ordered tasks, milestones, sprint breakdown",
    color: "text-emerald-600 dark:text-emerald-400",
    icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z",
  },
];

const OutputPackMock = () => {
  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="mb-1 flex items-center gap-2">
        <span className="font-mono-tight text-[10px] text-zinc-950/40 dark:text-zinc-50/40">Output Pack</span>
        <span className="ml-auto rounded-full border border-primary/25 bg-primary/8 px-2 py-0.5 font-mono-tight text-[9px] text-primary/80">
          4 files ready
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {outputFiles.map((file, i) => (
          <div
            key={file.name}
            className="flex items-start gap-3 rounded-lg border border-zinc-950/8 bg-zinc-950/[0.02] p-2.5 transition-colors hover:border-zinc-950/15 dark:border-zinc-50/8 dark:bg-zinc-50/[0.02] dark:hover:border-zinc-50/15"
            style={{
              animationDelay: `${i * 80}ms`,
            }}
          >
            <div className={`mt-0.5 shrink-0 ${file.color}`}>
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={file.icon} />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono-tight text-[11px] text-zinc-950/75 dark:text-zinc-50/75">{file.name}</p>
              <p className="mt-0.5 truncate font-mono-tight text-[10px] text-zinc-950/35 dark:text-zinc-50/35">
                {file.desc}
              </p>
            </div>
            <svg
              aria-hidden="true"
              className="mt-0.5 size-3.5 shrink-0 text-zinc-950/25 dark:text-zinc-50/25"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Feature rows data ────────────────────────────────────────────────────────

const features = [
  {
    number: "01",
    label: "Guided Setup",
    headline: "Requirements discovery, without the blank page",
    body: "SeniorBob interviews you about what you're building using structured, guided questions. No architecture expertise required — just describe your idea and answer what feels natural.",
    bullets: [
      "Clarifies product type, users, and core workflows",
      "Multiple-choice answers for common patterns",
      "Infers complexity, storage needs, and auth baseline",
    ],
    visual: <GuidedSetupMock />,
  },
  {
    number: "02",
    label: "System Design Generator",
    headline: "Visual architecture, inferred from your requirements",
    body: "From your functional requirements, SeniorBob generates a complete system design diagram — components, services, data flow, and architecture decisions. Editable. Explainable.",
    bullets: [
      "Auto-generates nodes: services, databases, gateways",
      "Infers sync vs async, queues, and storage patterns",
      "AI panel explains every architecture decision",
    ],
    visual: <SystemDesignMock />,
  },
  {
    number: "03",
    label: "Project Output Pack",
    headline: "Claude Code-ready context, generated in one click",
    body: "Export a complete set of structured markdown files — requirements, system design, architecture decisions, and implementation plan — formatted for immediate use with Claude Code.",
    bullets: [
      "Drop-in prompt files for Claude Code sessions",
      "Implementation plan with ordered tasks and milestones",
      "Clean, structured markdown — no AI filler prose",
    ],
    visual: <OutputPackMock />,
  },
];

// ─── Row animation variants ───────────────────────────────────────────────────

const rowVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const, delay: i * 0.1 },
  }),
};

const mockVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const, delay: i * 0.1 + 0.15 },
  }),
};

// ─── Main export ──────────────────────────────────────────────────────────────

export const FeatureSection = () => {
  return (
    <section id="features" className="relative px-6 py-32">
      {/* Subtle dot pattern */}
      <div className="pointer-events-none absolute inset-0 bg-cosmos-dots" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="mb-4 block font-mono-tight text-[11px] uppercase tracking-widest text-primary/80">
            What SeniorBob does
          </span>
          <h2 className="max-w-2xl font-normal text-3xl text-editorial leading-tight tracking-tight text-zinc-950 md:text-4xl dark:text-zinc-50">
            Three steps from idea to Claude Code-ready
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-950/50 dark:text-zinc-50/50">
            No blank pages. No architecture guesswork. Just a clear path from idea to implementation.
          </p>
        </motion.div>

        {/* Feature rows */}
        <div className="flex flex-col">
          {features.map((feature, index) => {
            const isAlternate = index % 2 === 1;
            return (
              <div key={feature.number}>
                {index > 0 && <div className="border-t border-zinc-950/8 dark:border-zinc-50/8" />}
                <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-2 md:gap-16 lg:gap-24">
                  {/* Text half */}
                  <motion.div
                    className={`flex flex-col justify-center ${isAlternate ? "md:order-2" : "md:order-1"}`}
                    custom={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={rowVariants}
                  >
                    <div className="mb-5 flex items-center gap-3">
                      <span className="font-mono-tight text-[11px] text-zinc-950/25 dark:text-zinc-50/25">
                        {feature.number}
                      </span>
                      <span className="rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 font-mono-tight text-[10px] uppercase tracking-widest text-primary/80">
                        {feature.label}
                      </span>
                    </div>

                    <h3 className="mb-4 font-normal text-2xl text-editorial leading-tight tracking-tight text-zinc-950 md:text-3xl dark:text-zinc-50">
                      {feature.headline}
                    </h3>

                    <p className="mb-6 text-sm leading-relaxed text-zinc-950/50 dark:text-zinc-50/50">{feature.body}</p>

                    <ul className="flex flex-col gap-2">
                      {feature.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2.5">
                          <svg
                            aria-hidden="true"
                            className="mt-0.5 size-3.5 shrink-0 text-primary/60"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          <span className="text-sm leading-relaxed text-zinc-950/55 dark:text-zinc-50/55">
                            {bullet}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Visual half */}
                  <motion.div
                    className={`${isAlternate ? "md:order-1" : "md:order-2"}`}
                    custom={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={mockVariants}
                  >
                    <div className="relative">
                      {/* Ambient glow */}
                      <div className="pointer-events-none absolute inset-x-8 -top-8 h-24 rounded-full bg-primary/10 blur-[60px]" />

                      <div className="relative h-[300px] overflow-hidden rounded-xl border border-zinc-950/10 bg-zinc-950/[0.02] shadow-lg shadow-zinc-950/5 dark:border-zinc-50/10 dark:bg-zinc-50/[0.02] dark:shadow-zinc-950/20">
                        {feature.visual}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
