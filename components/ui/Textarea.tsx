import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cx } from "./utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...props },
  ref,
) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
      className={cx("cd-textarea", className)}
      data-invalid={invalid || undefined}
      ref={ref}
    />
  );
});
