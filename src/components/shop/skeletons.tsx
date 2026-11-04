import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal">
      <Skeleton className="aspect-square w-full rounded-none bg-white/5" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-20 bg-white/5" />
        <Skeleton className="h-4 w-3/4 bg-white/5" />
        <Skeleton className="h-6 w-24 bg-white/5" />
        <Skeleton className="h-9 w-full rounded-full bg-white/5" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="container-fz grid gap-10 py-10 lg:grid-cols-2" aria-busy="true">
      <Skeleton className="aspect-square w-full rounded-3xl bg-white/5" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-32 bg-white/5" />
        <Skeleton className="h-14 w-3/4 bg-white/5" />
        <Skeleton className="h-8 w-40 bg-white/5" />
        <Skeleton className="h-24 w-full bg-white/5" />
        <Skeleton className="h-14 w-full rounded-full bg-white/5" />
      </div>
    </div>
  );
}
