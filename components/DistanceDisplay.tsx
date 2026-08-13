import { formatDistance } from "@/lib/commerce-format";

type DistanceDisplayProps = {
  distanceMeters?: number | null;
  className?: string;
};

export function DistanceDisplay({ className = "", distanceMeters }: DistanceDisplayProps) {
  const distance = formatDistance(distanceMeters);
  if (!distance) return null;

  return (
    <span className={["cd-distance", className].filter(Boolean).join(" ")}>
      <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14">
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <circle cx="12" cy="10" fill="currentColor" r="2" />
      </svg>
      <span>{distance}</span>
    </span>
  );
}
