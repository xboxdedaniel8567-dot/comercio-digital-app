import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { FieldError } from "./FieldError";
import { cx } from "./utils";

type FieldControlProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  id?: string;
};

type FieldProps = {
  children: ReactElement<FieldControlProps>;
  className?: string;
  error?: string;
  helperText?: ReactNode;
  id?: string;
  label: ReactNode;
  optional?: boolean;
};

export function Field({ children, className, error, helperText, id, label, optional = false }: FieldProps) {
  const generatedId = useId();
  const controlId = id ?? children.props.id ?? generatedId;
  const helperId = helperText ? `${controlId}-helper` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [children.props["aria-describedby"], helperId, errorId].filter(Boolean).join(" ") || undefined;

  if (!isValidElement(children)) return null;

  const control = cloneElement(children, {
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : children.props["aria-invalid"],
    id: controlId,
  });

  return (
    <div className={cx("cd-field", className)} data-invalid={Boolean(error) || undefined}>
      <label className="cd-field-label" htmlFor={controlId}>
        {label}
        {optional ? <span className="cd-field-optional">Opcional</span> : null}
      </label>
      {control}
      {helperText ? <p className="cd-field-helper" id={helperId}>{helperText}</p> : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
