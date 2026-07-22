export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="h-8 w-56 animate-pulse rounded bg-border-blue" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-border-blue" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-border-blue" />
    </div>
  );
}
