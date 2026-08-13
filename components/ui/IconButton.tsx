import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "./utils";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> & {
  "aria-label": string;
  children: ReactNode;
  iconSize?: 16 | 20 | 24;
  variant?: "secondary" | "ghost" | "destructive";
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { children, className, iconSize = 20, type = "button", variant = "ghost", ...props },
  ref,
) {
  return (
    <button
      {...props}
      className={cx("cd-icon-button", `cd-icon-button-${variant}`, className)}
      ref={ref}
      style={{ "--cd-icon-size": `${iconSize}px` } as React.CSSProperties}
      type={type}
    >
      {children}
    </button>
  );
});
