export function CatalogSkeleton() {
  return (
    <div className="container-x py-10" role="status" aria-live="polite">
      <div className="h-24 animate-pulse bg-cream" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse bg-cream" />)}
      </div>
      <span className="sr-only">Loading products</span>
    </div>
  );
}
