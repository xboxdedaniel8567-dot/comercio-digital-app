import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
};

export function EmptyState({ action, description, icon, title }: EmptyStateProps) {
  return (
    <section className="cd-empty-state" aria-label={title}>
      {icon ? <div aria-hidden="true" className="cd-empty-state-icon">{icon}</div> : null}
      <div className="cd-empty-state-copy">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action ? <div className="cd-empty-state-action">{action}</div> : null}
    </section>
  );
}
