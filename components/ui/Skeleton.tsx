import type { HTMLAttributes } from "react";
import { cx } from "./utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} aria-hidden="true" className={cx("cd-skeleton", className)} />;
}
