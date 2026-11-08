import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creative CRM",
  description:
    "A thoughtful home for your relationships, follow-ups, and everyday work.",
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
