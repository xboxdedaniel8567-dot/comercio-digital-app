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
    <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0 }}>Nueva categoria</h2>
      <p className="muted" style={{ margin: 0 }}>
        Agrega categorias principales para que comerciantes puedan clasificar sus productos.
      </p>
      <input
        className="input"
        onChange={(event) => handleNameChange(event.target.value)}
        placeholder="Nombre. Ej: Hogar"
        required
        value={name}
      />
      <input
        className="input"
        onChange={(event) => setSlug(event.target.value)}
        placeholder="Slug automatico"
        required
        value={slug}
      />
      <textarea
        className="input"
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Descripcion corta"
        rows={3}
        value={description}
      />
      <button className="btn" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creando..." : "Crear categoria"}
      </button>
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}
