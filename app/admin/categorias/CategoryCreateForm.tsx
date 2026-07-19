"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryCreateForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    setSlug(slugify(value));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("Creando categoria...");

    const cleanName = name.trim();
    const cleanSlug = slugify(slug || name);

    if (!cleanName || !cleanSlug) {
      setIsSubmitting(false);
      setMessage("Escribe un nombre valido para la categoria.");
      return;
    }

    const { error } = await supabase.from("categories").insert({
      description: description.trim() || null,
      name: cleanName,
      slug: cleanSlug,
    });

    if (error) {
      setIsSubmitting(false);
      setMessage(`No se pudo crear la categoria: ${error.message}`);
      return;
    }

    setMessage("Categoria creada correctamente. Actualizando lista...");
    window.location.reload();
  }

  return (
    <form className="admin-taxonomy-form panel" onSubmit={handleSubmit}>
      <div><span className="eyebrow">Nivel principal</span><h2>Nueva categoria</h2></div>
      <p className="muted">
        Agrega categorias principales para que comerciantes puedan clasificar sus productos.
      </p>
      <label className="merchant-field"><span>Nombre</span>
      <input
        className="input"
        onChange={(event) => handleNameChange(event.target.value)}
        placeholder="Nombre. Ej: Hogar"
        required
        value={name}
      />
      </label>
      <label className="merchant-field"><span>Direccion interna (slug)</span>
      <input
        className="input"
        onChange={(event) => setSlug(event.target.value)}
        placeholder="Slug automatico"
        required
        value={slug}
      />
      </label>
      <label className="merchant-field"><span>Descripcion</span>
      <textarea
        className="input"
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Descripcion corta"
        rows={3}
        value={description}
      />
      </label>
      <button className="btn" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creando..." : "Crear categoria"}
      </button>
      {message ? <p className="merchant-form-message" role="status">{message}</p> : null}
    </form>
  );
}
