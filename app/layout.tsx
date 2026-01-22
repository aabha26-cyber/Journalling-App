import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beautiful Journal",
  description: "A beautiful, colorful journaling app with mood tracking and rich features",
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
