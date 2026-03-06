"use client";

import type { NodeProps } from "@xyflow/react";
import { Database } from "lucide-react";

import { BaseNode } from "./base-node";

type DatabaseNodeData = { label?: string; sublabel?: string };

export function DatabaseNode({ data, selected }: NodeProps & { data: DatabaseNodeData }) {
  return (
    <BaseNode
      icon={Database}
      label={data.label ?? "Database"}
      sublabel={data.sublabel}
      selected={selected}
      accentColor="bg-emerald-500/15"
    />
  );
}
