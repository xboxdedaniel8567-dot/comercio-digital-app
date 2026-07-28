"use client";

import { useEffect } from "react";

export function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.addEventListener("updatefound", () => {
            const installing = registration.installing;
            if (!installing) return;

            installing.addEventListener("statechange", () => {
              if (installing.state === "installed" && navigator.serviceWorker.controller) {
                const shouldReload = window.confirm(
                  "Hay una nueva version de Comercio Digital. ¿Actualizar ahora?",
                );
                if (shouldReload) {
                  installing.postMessage({ type: "SKIP_WAITING" });
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error("No se pudo registrar el modo instalable:", error);
        });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
  }, []);

  return null;
}
