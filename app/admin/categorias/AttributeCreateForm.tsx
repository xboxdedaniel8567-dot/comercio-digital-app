"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Category = { id: string; name: string };
type Subcategory = { id: string; name: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AttributeCreateForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [name, setName] = useState("");
  const [inputType, setInputType] = useState("text");
  const [isRequired, setIsRequired] = useState(false);
  const [message, setMessage] = useState("Cargando categorias...");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase.from("categories").select("id, name").order("name");
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

  useEffect(() => {
    async function loadSubcategories() {
      setSubcategoryId("");
      if (!categoryId) {
        setSubcategories([]);
        return;
      }
      const { data, error } = await supabase
        .from("subcategories")
        .select("id, name")
        .eq("category_id", categoryId)
        .eq("is_active", true)
        .order("name");
      if (error) {
        setMessage(`No se pudieron cargar las subcategorias: ${error.message}`);
        return;
      }
      setSubcategories((data ?? []) as Subcategory[]);
    }
    void loadSubcategories();
  }, [categoryId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const slug = slugify(cleanName);

    if (!categoryId || !cleanName || !slug) {
      setMessage("Selecciona una categoria y escribe un nombre valido.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Creando atributo...");

    const { error } = await supabase.from("category_attributes").insert({
      category_id: categoryId,
      input_type: inputType,
      is_required: isRequired,
      name: cleanName,
      slug,
      subcategory_id: subcategoryId || null,
    });

    if (error) {
      setIsSubmitting(false);
      setMessage(`No se pudo crear el atributo: ${error.message}`);
      return;
    }

    setMessage("Atributo creado correctamente.");
    window.location.reload();
  }

  return (
    <form className="admin-taxonomy-form panel" onSubmit={handleSubmit}>
      <div><span className="eyebrow">Campos adaptativos</span><h2>Nuevo atributo</h2></div>
      <p className="muted">
        Define la informacion que debe completar el comerciante para este tipo de producto.
      </p>
      <label className="merchant-field"><span>Categoria principal</span>
      <select className="input" onChange={(event) => setCategoryId(event.target.value)} required value={categoryId}>
        <option value="">Selecciona una categoria</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>
      </label>
      <label className="merchant-field"><span>Subcategoria</span>
      <select className="input" onChange={(event) => setSubcategoryId(event.target.value)} value={subcategoryId}>
        <option value="">Toda la categoria</option>
        {subcategories.map((subcategory) => (
          <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
        ))}
      </select>
      </label>
      <label className="merchant-field"><span>Nombre del atributo</span><input className="input" onChange={(event) => setName(event.target.value)} placeholder="Ej. Memoria RAM" required value={name} /></label>
      <label className="merchant-field"><span>Tipo de respuesta</span>
      <select className="input" onChange={(event) => setInputType(event.target.value)} value={inputType}>
        <option value="text">Texto</option>
        <option value="number">Numero</option>
      </select>
      </label>
      <label className="admin-checkbox-field">
        <input checked={isRequired} onChange={(event) => setIsRequired(event.target.checked)} type="checkbox" />
        Campo obligatorio
      </label>
      <button className="btn" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creando..." : "Crear atributo"}
      </button>
      {message ? <p className="merchant-form-message" role="status">{message}</p> : null}
    </form>
  );
}
