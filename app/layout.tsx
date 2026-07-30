import type { Metadata, Viewport } from "next";
import { PwaRegistration } from "../components/PwaRegistration";
import { AppFooter } from "@/components/AppFooter";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Comercio Digital - Encuentra productos en comercios fisicos",
  description:
    "Marketplace inteligente para buscar productos en tiendas fisicas, contactar comercios por WhatsApp y digitalizar negocios locales.",
  applicationName: "Comercio Digital",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/brand-icon.png",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Comercio Digital",
  },
  openGraph: {
    title: "Comercio Digital",
    description:
      "La plataforma de Gregor Magnus para conectar compradores con comercios fisicos.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#090a0c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="es">
        <body>
          <PwaRegistration />
          {children}
          <AppFooter />
        </body>
      </html>
  );
}
