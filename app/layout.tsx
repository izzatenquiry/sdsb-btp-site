import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BTP QAQC Control Centre",
  description: "Private QAQC dashboard and registers for Banting Technology Park.",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
