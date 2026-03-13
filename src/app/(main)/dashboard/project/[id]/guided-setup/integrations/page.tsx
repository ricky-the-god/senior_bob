import Link from "next/link";

import { ArrowLeft, ChevronRight } from "lucide-react";

import { parseProjectMeta } from "@/lib/project-types";
import { getProject } from "@/lib/queries/get-project";

import { IntegrationsChat } from "./_components/integrations-chat";
import { IntegrationsSummary } from "./_components/integrations-summary";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function IntegrationsPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);
  const meta = parseProjectMeta(project?.description ?? null);
  const data = meta.guided_setup?.integrations ?? null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-border border-b px-6 py-3">
        <Link
          href={`/dashboard/project/${id}/guided-setup`}
          className="flex items-center gap-1.5 text-muted-foreground text-xs transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Guided Setup
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/30" />
        <span className="text-foreground/60 text-xs">Integrations</span>
      </div>
      {data?.completed ? (
        <IntegrationsSummary projectId={id} initialData={data} />
      ) : (
        <IntegrationsChat projectId={id} initialData={data} />
      )}
    </div>
  );
}
