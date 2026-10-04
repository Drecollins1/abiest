import type { Metadata, Viewport } from "next";
import { display, sans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "ABIEST | Crispy plantain chips, plantain flour & honey beans", template: "%s | ABIEST" },
  description:
    "Crispy ripe and unripe plantain chips, unripe plantain flour and stone-free honey beans. Processed and packaged by ABIEST Foodmart Ventures in Osun State.",
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = { themeColor: "#005210" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
