"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("confirmed") === "1") {
      setMessage("Correo confirmado. Ya puedes iniciar sesion.");
    }
  }, []);

  function authErrorMessage(errorMessage: string) {
    if (errorMessage.toLowerCase().includes("email not confirmed")) {
      return "Debes confirmar tu correo antes de iniciar sesion.";
    }
    if (errorMessage.toLowerCase().includes("invalid login credentials")) {
      return "El correo o la contrasena no son correctos.";
    }
    return errorMessage;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("Iniciando sesion...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setMessage(`No se pudo iniciar sesion: ${authErrorMessage(error.message)}`);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const { data: profile } = userData.user
      ? await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle()
      : { data: null };

    setMessage("Sesion iniciada. Entrando...");
    const requestedPath = new URLSearchParams(window.location.search).get("next");
    const safePath = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
      ? requestedPath
      : "/panel";
    const isAdmin = profile && ["admin", "super_admin"].includes(profile.role);
    const isBuyer = profile?.role === "buyer";
    window.location.href = isAdmin
      ? (safePath.startsWith("/admin") ? safePath : "/admin")
      : isBuyer
        ? (safePath.startsWith("/panel") ? "/cuenta" : safePath)
        : (safePath.startsWith("/cuenta") ? "/panel" : safePath);
  }

  return (
    <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
      <input
        className="input"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Correo"
        required
        type="email"
        value={email}
      />
      <input
        className="input"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Contrasena"
        required
        type="password"
        value={password}
      />
      <button className="btn" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Entrando..." : "Iniciar sesion"}
      </button>
      <Link className="muted" href="/panel/recuperar">
        Olvide mi contrasena
      </Link>
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}
