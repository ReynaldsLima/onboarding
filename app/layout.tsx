import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Portal de onboarding para agentes de WhatsApp",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full bg-bg text-text font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
