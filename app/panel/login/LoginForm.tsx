"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { supabase } from "@/lib/supabase";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRedirecting = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    async function finishOAuthSignIn() {
      if (params.get("oauth") !== "1" || isRedirecting.current) return;

      const oauthError = params.get("error_description");
      if (oauthError) {
        setMessage(`No se pudo continuar con Google: ${oauthError}`);
        return;
      }

      setIsSubmitting(true);
      setMessage("Completando acceso con Google...");

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (sessionError || !user) {
        setIsSubmitting(false);
        setMessage(
          `No se pudo completar el acceso con Google: ${sessionError?.message ?? "No encontramos una sesion valida."}`,
        );
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setIsSubmitting(false);
        setMessage(`No se pudo verificar tu perfil: ${profileError.message}`);
        return;
      }

      isRedirecting.current = true;
      const requestedPath = params.get("next");
      const safePath = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : "/panel";

      if (!profile) {
        window.location.href = "/cuenta/registro";
        return;
      }

      const isAdmin = ["admin", "super_admin"].includes(profile.role);
      const isBuyer = profile.role === "buyer";
      window.location.href = isAdmin
        ? (safePath.startsWith("/admin") ? safePath : "/admin")
        : isBuyer
          ? (safePath.startsWith("/panel") ? "/cuenta" : safePath)
          : (safePath.startsWith("/cuenta") ? "/panel" : safePath);
    }

    void finishOAuthSignIn();

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
    <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <label htmlFor="login-email" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
          Correo electronico
        </label>
        <input
          autoComplete="email"
          className="input"
          id="login-email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@correo.com"
          required
          type="email"
          value={email}
        />
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <label htmlFor="login-password" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
          Contrasena
        </label>
        <input
          autoComplete="current-password"
          className="input"
          id="login-password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Tu contrasena"
          required
          type="password"
          value={password}
        />
      </div>
      <button className="btn" disabled={isSubmitting} type="submit" style={{ minHeight: 50 }}>
        {isSubmitting ? "Entrando..." : "Iniciar sesion"}
      </button>
      <div
        aria-hidden="true"
        style={{ alignItems: "center", display: "flex", gap: 12 }}
      >
        <span style={{ background: "var(--line)", flex: 1, height: 1 }} />
        <span className="muted" style={{ fontSize: "0.78rem" }}>o</span>
        <span style={{ background: "var(--line)", flex: 1, height: 1 }} />
      </div>
      <GoogleAuthButton
        disabled={isSubmitting}
        nextPath={new URLSearchParams(typeof window === "undefined" ? "" : window.location.search).get("next") ?? undefined}
        onError={setMessage}
      />
      <Link className="muted" href="/panel/recuperar" style={{ fontSize: "0.88rem", textDecoration: "none", transition: "color var(--transition)" }}>
        Olvide mi contrasena
      </Link>
      {message ? (
        <p className="muted" style={{ fontSize: "0.88rem", margin: 0 }}>{message}</p>
      ) : null}
    </form>
  );
}
