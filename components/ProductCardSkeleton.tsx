import { Skeleton } from "@/components/ui";

type ProductCardSkeletonProps = {
  variant?: "grid" | "horizontal" | "mapPreview";
};

export function ProductCardSkeleton({ variant = "grid" }: ProductCardSkeletonProps) {
  return (
    <div aria-hidden="true" className={`cd-product-card cd-product-card-${variant} cd-card-skeleton`}>
      <Skeleton className="cd-product-card-media" />
      <div className="cd-product-card-body">
        <Skeleton className="cd-skeleton-line cd-skeleton-line-short" />
        <Skeleton className="cd-skeleton-line cd-skeleton-line-title" />
        <Skeleton className="cd-skeleton-line cd-skeleton-line-price" />
        <Skeleton className="cd-skeleton-line" />
      </div>
    </div>
  );
}
