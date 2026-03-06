"use client";

import type { NodeProps } from "@xyflow/react";
import { Globe } from "lucide-react";

import { BaseNode } from "./base-node";

type ExternalNodeData = { label?: string; sublabel?: string };

export function ExternalNode({ data, selected }: NodeProps & { data: ExternalNodeData }) {
  return (
    <BaseNode
      icon={Globe}
      label={data.label ?? "External"}
      sublabel={data.sublabel}
      selected={selected}
      dashed
      accentColor="bg-foreground/5"
    />
  );
}
