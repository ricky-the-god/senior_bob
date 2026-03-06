"use client";

import type { NodeProps } from "@xyflow/react";
import { Zap } from "lucide-react";

import { BaseNode } from "./base-node";

type CacheNodeData = { label?: string; sublabel?: string };

export function CacheNode({ data, selected }: NodeProps & { data: CacheNodeData }) {
  return (
    <BaseNode
      icon={Zap}
      label={data.label ?? "Cache"}
      sublabel={data.sublabel}
      selected={selected}
      accentColor="bg-yellow-500/15"
    />
  );
}
