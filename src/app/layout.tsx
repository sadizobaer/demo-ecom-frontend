import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { generateCssVars } from "@/lib/theme";
import RootProviders from "./RootProviders";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ShopWave — Modern E-Commerce",
    template: "%s | ShopWave",
  },
  description:
    "Discover thousands of products at the best prices. Fast shipping, easy returns.",
  keywords: ["ecommerce", "shop", "online store"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cssVars = generateCssVars();

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root { ${cssVars} }` }} />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}

