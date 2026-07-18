"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function SubcategoryCreateForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("Cargando categorias...");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) {
        setMessage(`No se pudieron cargar las categorias: ${error.message}`);
        return;
      }

      const rows = (data ?? []) as Category[];
      setCategories(rows);
      setCategoryId(rows[0]?.id ?? "");
      setMessage("");
    }

    void loadCategories();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const slug = slugify(cleanName);

    if (!categoryId || !cleanName || !slug) {
      setMessage("Selecciona una categoria y escribe un nombre valido.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Creando subcategoria...");

    const { error } = await supabase.from("subcategories").insert({
      category_id: categoryId,
      description: description.trim() || null,
      is_active: true,
      name: cleanName,
      slug,
    });

    if (error) {
      setIsSubmitting(false);
      setMessage(`No se pudo crear la subcategoria: ${error.message}`);
      return;
    }

    setMessage("Subcategoria creada correctamente.");
    window.location.reload();
  }

  return (
    <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0 }}>Nueva subcategoria</h2>
      <p className="muted" style={{ margin: 0 }}>
        Divide una categoria en grupos mas precisos para mejorar la busqueda.
      </p>
      <select
        className="input"
        onChange={(event) => setCategoryId(event.target.value)}
        required
        value={categoryId}
      >
        <option value="">Selecciona una categoria</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>
      <input
        className="input"
        onChange={(event) => setName(event.target.value)}
        placeholder="Nombre. Ej: Computadores"
        required
        value={name}
      />
      <textarea
        className="input"
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Descripcion corta"
        rows={3}
        value={description}
      />
      <button className="btn" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creando..." : "Crear subcategoria"}
      </button>
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}

