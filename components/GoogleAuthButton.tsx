"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type GoogleAuthButtonProps = {
  disabled?: boolean;
  nextPath?: string;
  onError: (message: string) => void;
};

export function GoogleAuthButton({
  disabled = false,
  nextPath,
  onError,
}: GoogleAuthButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function continueWithGoogle() {
    if (disabled || isRedirecting) return;

    setIsRedirecting(true);
    onError("");

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (nextPath) callbackUrl.searchParams.set("next", nextPath);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setIsRedirecting(false);
      onError("No pudimos continuar con Google. Intenta nuevamente.");
    }
  }

  return (
    <button
      aria-label="Continuar con Google"
      className="btn btn-dark"
      disabled={disabled || isRedirecting}
      onClick={() => void continueWithGoogle()}
      style={{ minHeight: 50, width: "100%" }}
      type="button"
    >
      {isRedirecting ? "Abriendo Google..." : "Continuar con Google"}
    </button>
  );
}
