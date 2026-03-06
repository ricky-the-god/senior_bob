import { Network } from "lucide-react";

import { CanvasPlaceholder } from "../_components/canvas-placeholder";

export default function SystemDesignPage() {
  return (
    <CanvasPlaceholder
      title="System Design"
      subtitle="Design and visualize your system architecture"
      emptyTitle="No architecture yet"
      emptyDescription="Start designing your system by adding services, databases, and connections."
      icon={Network}
    />
  );
}
