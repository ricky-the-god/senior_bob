import { Database } from "lucide-react";

import { CanvasPlaceholder } from "../_components/canvas-placeholder";

export default function SchemaPage() {
  return (
    <CanvasPlaceholder
      title="Schema Visualizer"
      subtitle="Visualize and explore your data models"
      emptyTitle="No schema connected"
      emptyDescription="Connect a database or define your entities to visualize your data models here."
      icon={Database}
    />
  );
}
