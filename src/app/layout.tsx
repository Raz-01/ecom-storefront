import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { businessConfig } from "@/lib/business.config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: businessConfig.name, template: `%s — ${businessConfig.name}` },
  description: businessConfig.description,
};

/** Bare shell only — the storefront header lives in `(site)/layout.tsx` and the admin chrome in `admin/(protected)/layout.tsx`, so neither bleeds into the other. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stone-50">{children}</body>
    </html>
  );
}
