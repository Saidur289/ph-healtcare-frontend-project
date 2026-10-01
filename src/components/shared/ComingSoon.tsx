// Temporary page body for routes that are linked in the sidebar but not built yet (see plan.md Phase 7/8).
const ComingSoon = ({ title }: { title: string }) => {
  return (
    <div className="rounded-xl border bg-card p-8 text-center">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This page is coming soon.
      </p>
    </div>
  );
};

export default ComingSoon;
