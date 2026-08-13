import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "./utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, prefix, suffix, ...props },
  ref,
) {
  const control = (
    <input
      {...props}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
      className={cx("cd-input", className)}
      data-invalid={invalid || undefined}
      ref={ref}
    />
  );

  if (!prefix && !suffix) return control;

  return (
    <span className="cd-input-shell" data-disabled={props.disabled || undefined} data-invalid={invalid || undefined}>
      {prefix ? <span className="cd-input-affix">{prefix}</span> : null}
      {control}
      {suffix ? <span className="cd-input-affix">{suffix}</span> : null}
    </span>
  );
});
