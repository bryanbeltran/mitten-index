import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mitten Index",
  description: "How brutal does it really feel out there?",
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

