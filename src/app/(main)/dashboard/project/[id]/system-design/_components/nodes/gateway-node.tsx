"use client";

import type { NodeProps } from "@xyflow/react";
import { Network } from "lucide-react";

import { BaseNode } from "./base-node";

type GatewayNodeData = { label?: string; sublabel?: string };

export function GatewayNode({ data, selected }: NodeProps & { data: GatewayNodeData }) {
  return (
    <BaseNode
      icon={Network}
      label={data.label ?? "API Gateway"}
      sublabel={data.sublabel}
      selected={selected}
      accentColor="bg-purple-500/15"
    />
  );
}
