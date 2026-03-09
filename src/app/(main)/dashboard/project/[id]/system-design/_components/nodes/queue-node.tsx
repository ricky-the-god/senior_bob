"use client";

import type { NodeProps } from "@xyflow/react";
import { ArrowRightLeft } from "lucide-react";

import { BaseNode } from "./base-node";

type QueueNodeData = { label?: string; sublabel?: string };

export function QueueNode({ id, data, selected }: NodeProps & { data: QueueNodeData }) {
  return (
    <BaseNode
      id={id}
      icon={ArrowRightLeft}
      label={data.label ?? "Queue"}
      sublabel={data.sublabel}
      selected={selected}
      accentColor="bg-orange-500/15"
    />
  );
}
