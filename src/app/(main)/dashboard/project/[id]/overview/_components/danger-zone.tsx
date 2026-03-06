"use client";

import { useTransition } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/server/projects";

type Props = {
  projectId: string;
  projectName: string;
};

export function DangerZone({ projectId, projectName }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteProject(projectId);
    });
  }

  return (
    <section className="space-y-3">
      <h2 className="font-medium text-destructive/70 text-xs uppercase tracking-wider">Danger Zone</h2>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <div>
          <p className="font-medium text-foreground text-sm">Delete this project</p>
          <p className="mt-0.5 text-muted-foreground text-xs">
            Permanently delete <span className="text-foreground">{projectName}</span> and all its data. This cannot be
            undone.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isPending}>
              {isPending ? "Deleting…" : "Delete project"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &ldquo;{projectName}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the project and all associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, delete project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}
