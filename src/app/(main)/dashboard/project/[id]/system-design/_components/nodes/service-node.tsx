"use client";

import type { NodeProps } from "@xyflow/react";
import { Server } from "lucide-react";

import { BaseNode } from "./base-node";

type ServiceNodeData = { label?: string; sublabel?: string };

export function ServiceNode({ data, selected }: NodeProps & { data: ServiceNodeData }) {
  return (
    <BaseNode
      icon={Server}
      label={data.label ?? "Service"}
      sublabel={data.sublabel}
      selected={selected}
      accentColor="bg-blue-500/15"
    />
  );
}
