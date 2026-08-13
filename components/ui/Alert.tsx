import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./utils";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  action?: ReactNode;
  message: ReactNode;
  title?: ReactNode;
  tone?: "info" | "success" | "warning" | "danger";
};

export function Alert({ action, className, message, title, tone = "info", ...props }: AlertProps) {
  return (
    <div
      {...props}
      aria-live={tone === "danger" ? "assertive" : "polite"}
      className={cx("cd-alert", `cd-alert-${tone}`, className)}
      role={tone === "danger" ? "alert" : "status"}
    >
      <span aria-hidden="true" className="cd-alert-indicator" />
      <div className="cd-alert-content">
        {title ? <strong className="cd-alert-title">{title}</strong> : null}
        <div className="cd-alert-message">{message}</div>
      </div>
      {action ? <div className="cd-alert-action">{action}</div> : null}
    </div>
  );
}
