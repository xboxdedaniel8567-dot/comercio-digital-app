"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AttributeDefinition = {
  id: string;
  input_type: string;
  is_required: boolean;
  name: string;
  slug: string;
  subcategory_id: string | null;
};

type AdaptiveAttributeFieldsProps = {
  categoryId: string;
  disabled?: boolean;
  onError: (message: string) => void;
  onValuesChange: (values: Record<string, string>) => void;
  subcategoryId: string;
  values: Record<string, string>;
};

export function AdaptiveAttributeFields({
  categoryId,
  disabled = false,
  onError,
  onValuesChange,
  subcategoryId,
  values,
}: AdaptiveAttributeFieldsProps) {
  const [definitions, setDefinitions] = useState<AttributeDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadDefinitions() {
      if (!categoryId) {
        setDefinitions([]);
        onValuesChange({});
        return;
      }

      setIsLoading(true);

      let query = supabase
        .from("category_attributes")
        .select("id, input_type, is_required, name, slug, subcategory_id")
        .eq("category_id", categoryId)
        .order("sort_order")
        .order("name");

      query = subcategoryId
        ? query.or(`subcategory_id.is.null,subcategory_id.eq.${subcategoryId}`)
        : query.is("subcategory_id", null);

      const { data, error } = await query;

      if (error) {
        setDefinitions([]);
        onError(`No se pudieron cargar los campos de la categoria: ${error.message}`);
        setIsLoading(false);
        return;
      }

      const rows = (data ?? []) as AttributeDefinition[];
      setDefinitions(rows);
      onValuesChange(
        Object.fromEntries(rows.map((definition) => [definition.id, values[definition.id] ?? ""])),
      );
      setIsLoading(false);
    }

    void loadDefinitions();
    // Values are intentionally excluded: typing must not reload the definitions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, subcategoryId]);

  if (isLoading) {
    return <p className="muted">Cargando campos de esta categoria...</p>;
  }

  if (definitions.length === 0) {
    return null;
  }

  return (
    <fieldset
      style={{
        border: 0,
        borderTop: "1px solid var(--line)",
        display: "grid",
        gap: 12,
        margin: "4px 0 0",
        padding: "18px 0 0",
      }}
    >
      <legend style={{ paddingRight: 12 }}><strong>Detalles del producto</strong></legend>
      <p className="muted" style={{ margin: 0 }}>
        Estos campos se adaptan automaticamente a la categoria seleccionada.
      </p>
      {definitions.map((definition) => (
        <label key={definition.id} style={{ display: "grid", gap: 6 }}>
          <span>
            {definition.name}
            {definition.is_required ? " *" : ""}
          </span>
          <input
            className="input"
            disabled={disabled}
            inputMode={definition.input_type === "number" ? "decimal" : undefined}
            onChange={(event) =>
              onValuesChange({
                ...values,
                [definition.id]: event.target.value,
              })
            }
            placeholder={`Escribe ${definition.name.toLowerCase()}`}
            required={definition.is_required}
            type={definition.input_type === "number" ? "number" : "text"}
            value={values[definition.id] ?? ""}
          />
        </label>
      ))}
    </fieldset>
  );
}
