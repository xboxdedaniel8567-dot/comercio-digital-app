import { Skeleton } from "@/components/ui";

type StoreCardSkeletonProps = {
  variant?: "standard" | "featured" | "mapPreview";
};

export function StoreCardSkeleton({ variant = "standard" }: StoreCardSkeletonProps) {
  return (
    <div aria-hidden="true" className={`cd-store-card cd-store-card-${variant} cd-card-skeleton`}>
      <Skeleton className="cd-store-card-media" />
      <div className="cd-store-card-body">
        <Skeleton className="cd-skeleton-line cd-skeleton-line-short" />
        <Skeleton className="cd-skeleton-line cd-skeleton-line-title" />
        <Skeleton className="cd-skeleton-line" />
        <Skeleton className="cd-skeleton-line cd-skeleton-line-short" />
      </div>
    </div>
  );
}
