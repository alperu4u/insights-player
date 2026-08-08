import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Player Development Profile | Castro Player Development",
  description: "An evidence-based soccer player assessment for better learning, communication, competition and development.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
