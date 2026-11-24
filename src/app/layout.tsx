import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-context";
import { EUConsentBanner } from "@/components/privacy";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "CV Builder",
  description: "Build tailored CVs for your target country and purpose.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
          <EUConsentBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
