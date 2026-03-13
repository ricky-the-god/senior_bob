import { Package } from "lucide-react";

import { CanvasPlaceholder } from "../_components/canvas-placeholder";

export default function OutputPackPage() {
  return (
    <CanvasPlaceholder
      title="Output Pack"
      subtitle="Generate implementation-ready files and Claude Code prompts"
      emptyTitle="No outputs generated"
      emptyDescription="Complete the guided setup and system design to generate your project context pack."
      icon={Package}
    />
  );
}
