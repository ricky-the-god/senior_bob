"use client";

import { useState } from "react";

import { PlusIcon } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProject } from "@/server/projects";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create canvas"}
    </Button>
  );
}

export function NewCanvasButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <PlusIcon />
          New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New canvas</DialogTitle>
        </DialogHeader>
        <form action={createProject} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="canvas-name">Canvas name</Label>
            <Input id="canvas-name" name="name" placeholder="My system design" required autoFocus />
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
