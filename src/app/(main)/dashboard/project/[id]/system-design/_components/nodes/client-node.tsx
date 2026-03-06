"use client";

import type { NodeProps } from "@xyflow/react";
import { Monitor } from "lucide-react";

import { BaseNode } from "./base-node";

type ClientNodeData = { label?: string; sublabel?: string };

export function ClientNode({ data, selected }: NodeProps & { data: ClientNodeData }) {
  return (
    <BaseNode
      icon={Monitor}
      label={data.label ?? "Client"}
      sublabel={data.sublabel}
      selected={selected}
      accentColor="bg-sky-500/15"
    />
  );
}
