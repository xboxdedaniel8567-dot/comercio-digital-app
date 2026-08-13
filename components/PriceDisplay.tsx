import { formatCommercePrice, type CommercePrice } from "@/lib/commerce-format";

type PriceDisplayProps = {
  value: CommercePrice;
  currency?: string | null;
  size?: "normal" | "large";
  className?: string;
};

export function PriceDisplay({ className = "", currency = "COP", size = "normal", value }: PriceDisplayProps) {
  return (
    <strong className={["cd-price", `cd-price-${size}`, className].filter(Boolean).join(" ")}>
      {formatCommercePrice(value, currency ?? "COP")}
    </strong>
  );
}
