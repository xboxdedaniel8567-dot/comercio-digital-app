import type { HTMLAttributes } from "react";
import { cx } from "./utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return <span {...props} className={cx("cd-badge", `cd-badge-${tone}`, className)} />;
}
