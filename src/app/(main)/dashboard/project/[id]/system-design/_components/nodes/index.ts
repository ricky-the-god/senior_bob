import type { NodeTypes } from "@xyflow/react";
import { ArrowRightLeft, Database, Globe, type LucideIcon, Monitor, Network, Server, Zap } from "lucide-react";

import { CacheNode } from "./cache-node";
import { ClientNode } from "./client-node";
import { DatabaseNode } from "./database-node";
import { ExternalNode } from "./external-node";
import { GatewayNode } from "./gateway-node";
import { QueueNode } from "./queue-node";
import { ServiceNode } from "./service-node";

// Defined outside any component to prevent re-renders
export const nodeTypes: NodeTypes = {
  service: ServiceNode,
  database: DatabaseNode,
  cache: CacheNode,
  queue: QueueNode,
  gateway: GatewayNode,
  client: ClientNode,
  external: ExternalNode,
};

export type NodeTypeId = keyof typeof nodeTypes;

// Single source of truth for labels + icons — consumed by NodePalette
export const NODE_PALETTE_ITEMS: { type: NodeTypeId; label: string; icon: LucideIcon }[] = [
  { type: "client", label: "Client", icon: Monitor },
  { type: "gateway", label: "API Gateway", icon: Network },
  { type: "service", label: "Service", icon: Server },
  { type: "database", label: "Database", icon: Database },
  { type: "cache", label: "Cache", icon: Zap },
  { type: "queue", label: "Queue", icon: ArrowRightLeft },
  { type: "external", label: "External", icon: Globe },
];
