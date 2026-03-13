import { Compass } from "lucide-react";

import { CanvasPlaceholder } from "../_components/canvas-placeholder";

export default function GuidedSetupPage() {
  return (
    <CanvasPlaceholder
      title="Guided Setup"
      subtitle="Answer a few questions to define your project requirements"
      emptyTitle="No setup started"
      emptyDescription="Walk through the guided flow to capture your project goals, features, and constraints."
      icon={Compass}
    />
  );
}
