import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal do Servidor - EE Profª Marlene Frattini",
  description: "Portal de Vantagens dos Servidores - EE Profª Marlene Frattini — Matão/SP",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gradient-to-br from-[#FDFCF8] via-white to-green-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
