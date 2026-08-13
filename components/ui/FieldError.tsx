import type { HTMLAttributes } from "react";
import { cx } from "./utils";

export function FieldError({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...props} className={cx("cd-field-error", className)} role="alert" />;
}
