type Props = {
  params: Promise<{ id: string }>;
};

export default async function CanvasPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground text-sm">Canvas {id}</p>
      <p className="text-muted-foreground text-xs">Canvas editor coming soon</p>
    </div>
  );
}
