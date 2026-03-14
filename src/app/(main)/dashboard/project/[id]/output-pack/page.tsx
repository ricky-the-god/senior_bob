import { parseProjectMeta } from "@/lib/project-types";
import { getDiagram } from "@/lib/queries/get-diagram";
import { getProject } from "@/lib/queries/get-project";

import { OutputPackShell } from "./_components/output-pack-shell";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OutputPackPage({ params }: Props) {
  const { id } = await params;

  const [project, diagram] = await Promise.all([getProject(id), getDiagram(id, "system-design")]);

  const meta = parseProjectMeta(project?.description ?? null);

  const diagramData = diagram?.data as { nodes?: unknown[] } | null;

  const prereqs = {
    workflow: !!meta.guided_setup?.workflow?.completed,
    features: !!meta.guided_setup?.features?.completed,
    integrations: !!meta.guided_setup?.integrations?.completed,
    diagram: !!((diagramData?.nodes?.length ?? 0) > 0),
  };

  const allPrereqsMet = Object.values(prereqs).every(Boolean);

  return (
    <OutputPackShell
      projectId={id}
      prereqs={prereqs}
      allPrereqsMet={allPrereqsMet}
      initialFiles={meta.output_pack?.files ?? null}
    />
  );
}
