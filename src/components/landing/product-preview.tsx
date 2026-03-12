"use client";

import { useEffect, useId, useState } from "react";

interface PreviewNode {
  id: string;
  label: string;
  type: "service" | "database" | "queue" | "client" | "gateway" | "cache";
  x: number;
  y: number;
}

interface PreviewEdge {
  from: string;
  to: string;
}

const previewNodes: PreviewNode[] = [
  { id: "client", label: "Client", type: "client", x: 40, y: 40 },
  { id: "gateway", label: "API Gateway", type: "gateway", x: 220, y: 40 },
  { id: "auth", label: "Auth Service", type: "service", x: 100, y: 160 },
  { id: "user", label: "User Service", type: "service", x: 340, y: 160 },
  { id: "mq", label: "Message Queue", type: "queue", x: 220, y: 280 },
  { id: "db", label: "PostgreSQL", type: "database", x: 220, y: 390 },
];

const previewEdges: PreviewEdge[] = [
  { from: "client", to: "gateway" },
  { from: "gateway", to: "auth" },
  { from: "gateway", to: "user" },
  { from: "auth", to: "mq" },
  { from: "user", to: "mq" },
  { from: "mq", to: "db" },
];

const nodeColors: Record<PreviewNode["type"], string> = {
  client: "from-sky-500/20 to-sky-600/10 border-sky-500/30",
  gateway: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
  service: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  database: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
  queue: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  cache: "from-rose-500/20 to-rose-600/10 border-rose-500/30",
};

const nodeGlows: Record<PreviewNode["type"], string> = {
  client: "shadow-sky-500/20",
  gateway: "shadow-amber-500/20",
  service: "shadow-blue-500/20",
  database: "shadow-emerald-500/20",
  queue: "shadow-purple-500/20",
  cache: "shadow-rose-500/20",
};

// Hoisted to module scope — allocated once, not on every render
const nodeIconPaths: Record<PreviewNode["type"], React.ReactNode> = {
  client: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3"
    />
  ),
  gateway: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
    />
  ),
  service: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
    />
  ),
  database: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75"
    />
  ),
  queue: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
    />
  ),
  cache: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"
    />
  ),
};

const NodeIcon = ({ type }: { type: PreviewNode["type"] }) => (
  <svg
    aria-hidden="true"
    className="size-3 shrink-0 text-zinc-950/70 dark:text-zinc-50/70"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    {nodeIconPaths[type]}
  </svg>
);

// Named offsets — node center relative to top-left position
const NODE_CENTER_X = 56;
const NODE_CENTER_Y = 14;

const getNodeCenter = (node: PreviewNode) => ({
  x: node.x + NODE_CENTER_X,
  y: node.y + NODE_CENTER_Y,
});

const paletteItems = [
  { label: "Service", type: "service" as const },
  { label: "Database", type: "database" as const },
  { label: "Cache", type: "cache" as const },
  { label: "Queue", type: "queue" as const },
  { label: "Gateway", type: "gateway" as const },
  { label: "Client", type: "client" as const },
];

const planItems = [
  { label: "Auth setup", done: true },
  { label: "DB schema", done: true },
  { label: "Queue impl", done: false },
  { label: "Deploy cfg", done: false },
  { label: "Rate limits", done: false },
];

const toolbarPaths = [
  "M12 4.5v15m7.5-7.5h-15",
  "M3.75 3.75v4.5m0-4.5h4.5m9.75 0v4.5m0-4.5h-4.5m-9.75 15v-4.5m0 4.5h4.5m9.75 0v-4.5m0 4.5h-4.5",
  "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
];

export const ProductPreview = () => {
  const uid = useId();
  const edgeGradientId = `${uid}-edge`;
  const activeEdgeGradientId = `${uid}-active-edge`;

  const [activeEdge, setActiveEdge] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveEdge((prev) => (prev + 1) % previewEdges.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full">
      {/* Ambient glow behind the window */}
      <div className="pointer-events-none absolute inset-x-0 -top-12 flex justify-center">
        <div className="h-40 w-2/3 rounded-full bg-primary/15 blur-[80px]" />
      </div>

      {/* App window */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-950/10 bg-zinc-50/80 shadow-2xl shadow-zinc-950/10 backdrop-blur-sm dark:border-zinc-50/10 dark:bg-zinc-950/80 dark:shadow-zinc-950/40">
        {/* Chrome bar */}
        <div className="flex h-10 items-center justify-between border-b border-zinc-950/8 bg-zinc-950/4 px-4 dark:border-zinc-50/8 dark:bg-zinc-50/4">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-red-400/70" />
            <div className="size-2.5 rounded-full bg-amber-400/70" />
            <div className="size-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <span className="font-mono-tight text-[11px] text-zinc-950/40 dark:text-zinc-50/40">
            System Design Canvas
          </span>
          <div className="flex items-center gap-2">
            {toolbarPaths.map((d, i) => (
              <svg
                key={i}
                aria-hidden="true"
                className="size-3.5 text-zinc-950/30 dark:text-zinc-50/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={d} />
              </svg>
            ))}
          </div>
        </div>

        {/* 3-panel layout */}
        <div className="grid h-[460px] grid-cols-1 md:grid-cols-[140px_1fr] lg:grid-cols-[140px_1fr_190px]">
          {/* Left — Node Palette */}
          <div className="hidden border-r border-zinc-950/8 bg-zinc-950/2 p-3 dark:border-zinc-50/8 dark:bg-zinc-50/2 md:block">
            <p className="mb-2.5 font-mono-tight text-[9px] uppercase tracking-widest text-zinc-950/30 dark:text-zinc-50/30">
              Components
            </p>
            <div className="flex flex-col gap-1.5">
              {paletteItems.map((item, i) => (
                <div
                  key={item.label}
                  className="flex cursor-default items-center gap-1.5 rounded-md border border-zinc-950/8 bg-zinc-950/3 px-2 py-1.5 transition-opacity duration-300 dark:border-zinc-50/8 dark:bg-zinc-50/3"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transitionDelay: `${i * 60}ms`,
                  }}
                >
                  <NodeIcon type={item.type} />
                  <span className="font-mono-tight text-[10px] text-zinc-950/60 dark:text-zinc-50/60">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Center — Canvas */}
          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_center,_theme(colors.zinc.950/3)_1px,_transparent_1px)] bg-[size:20px_20px] dark:bg-[radial-gradient(circle_at_center,_theme(colors.zinc.50/3)_1px,_transparent_1px)]">
            <svg aria-hidden="true" className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id={edgeGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="oklch(0.75 0.15 75 / 0.25)" />
                  <stop offset="100%" stopColor="oklch(0.75 0.15 75 / 0.08)" />
                </linearGradient>
                <linearGradient id={activeEdgeGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="oklch(0.75 0.15 75 / 0.9)" />
                  <stop offset="100%" stopColor="oklch(0.75 0.15 75 / 0.4)" />
                </linearGradient>
              </defs>
              {previewEdges.map((edge, index) => {
                const fromNode = previewNodes.find((n) => n.id === edge.from);
                const toNode = previewNodes.find((n) => n.id === edge.to);
                if (!fromNode || !toNode) return null;
                const from = getNodeCenter(fromNode);
                const to = getNodeCenter(toNode);
                const isActive = index === activeEdge;
                return (
                  <g key={`${edge.from}-${edge.to}`}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={isActive ? `url(#${activeEdgeGradientId})` : `url(#${edgeGradientId})`}
                      strokeWidth={isActive ? 2 : 1}
                      className="transition-all duration-500"
                    />
                    {isActive && (
                      <circle r="3" fill="oklch(0.75 0.15 75)" className="animate-pulse">
                        <animateMotion dur="0.9s" repeatCount="1" path={`M${from.x},${from.y} L${to.x},${to.y}`} />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {previewNodes.map((node, index) => (
              <div
                key={node.id}
                className={`absolute flex items-center gap-1.5 rounded-lg border bg-gradient-to-br px-2 py-1.5 shadow-lg ${nodeColors[node.type]} ${nodeGlows[node.type]}`}
                style={{
                  left: node.x + 24,
                  top: node.y + 24,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(8px)",
                  transition: "all 400ms",
                  transitionDelay: `${index * 80}ms`,
                  minWidth: "7rem",
                }}
              >
                <NodeIcon type={node.type} />
                <span className="font-mono-tight text-[10px] text-zinc-950/80 dark:text-zinc-50/80">{node.label}</span>
              </div>
            ))}
          </div>

          {/* Right — AI Plan Panel */}
          <div className="hidden border-l border-zinc-950/8 bg-zinc-950/2 p-3 dark:border-zinc-50/8 dark:bg-zinc-50/2 lg:flex lg:flex-col">
            <p className="mb-3 font-mono-tight text-[9px] uppercase tracking-widest text-zinc-950/30 dark:text-zinc-50/30">
              Implementation Plan
            </p>
            <div className="flex flex-1 flex-col gap-2">
              {planItems.map((item, i) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transition: "opacity 400ms",
                    transitionDelay: `${300 + i * 80}ms`,
                  }}
                >
                  <div
                    className={`flex size-3.5 shrink-0 items-center justify-center rounded-full border ${
                      item.done
                        ? "border-emerald-500/50 bg-emerald-500/20"
                        : "border-zinc-950/15 bg-zinc-950/5 dark:border-zinc-50/15 dark:bg-zinc-50/5"
                    }`}
                  >
                    {item.done && (
                      <svg
                        aria-hidden="true"
                        className="size-2 text-emerald-600 dark:text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`font-mono-tight text-[10px] ${
                      item.done
                        ? "text-zinc-950/40 line-through dark:text-zinc-50/40"
                        : "text-zinc-950/65 dark:text-zinc-50/65"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="mt-auto border-t border-zinc-950/8 pt-2 dark:border-zinc-50/8"
              style={{
                opacity: mounted ? 1 : 0,
                transition: "opacity 500ms",
                transitionDelay: "800ms",
              }}
            >
              <p className="font-mono-tight text-[9px] text-zinc-950/25 dark:text-zinc-50/25">
                Generated by Claude · 3.2s
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
