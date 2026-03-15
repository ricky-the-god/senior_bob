import { parseProjectMeta } from "@/lib/project-types";
import { getProject } from "@/lib/queries/get-project";

import { TasksBoard } from "./_components/tasks-board";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TasksPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);
  const meta = parseProjectMeta(project?.description ?? null);

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-6">
      <TasksBoard
        projectId={id}
        taskSprints={meta.task_sprints ?? null}
        projectMeta={{
          app_type: meta.app_type,
          tech_stack: meta.tech_stack,
          wizard_description: meta.wizard_description,
          infra: meta.infra,
          backend: meta.backend,
          guided_setup: meta.guided_setup,
        }}
      />
    </div>
  );
}
