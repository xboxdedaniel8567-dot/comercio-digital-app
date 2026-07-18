"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export function RecoveryForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("Enviando instrucciones...");

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/panel/restablecer`,
    });

    setIsSubmitting(false);

    if (error) {
      setMessage(`No se pudo enviar el correo: ${error.message}`);
      return;
    }

    setMessage(
      "Si el correo esta registrado, recibiras un enlace para crear una nueva contrasena.",
    );
  }

  return (
    <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
      <p className="muted" style={{ margin: 0 }}>
        Escribe el correo asociado a tu cuenta.
      </p>
      <input
        className="input"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Correo"
        required
        type="email"
        value={email}
      />
      <button className="btn" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Enviando..." : "Recuperar contrasena"}
      </button>
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}
