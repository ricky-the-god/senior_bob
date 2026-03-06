import type { ReactNode } from "react";

import { getProject } from "@/lib/queries/get-project";

import { ProjectNav } from "./_components/project-nav";

type Props = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export default async function CanvasLayout({ children, params }: Props) {
  const { id } = await params;
  const project = await getProject(id);

  return (
    <div className="-ml-4 md:-ml-6 -mt-4 md:-mt-6 -mb-4 md:-mb-6 flex h-[calc(100%+2rem)] overflow-hidden md:h-[calc(100%+3rem)]">
      <ProjectNav id={id} projectName={project?.name ?? "Project"} />
      {children}
    </div>
  );
}
