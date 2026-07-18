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
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
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
  themeColor: "#050505",
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
