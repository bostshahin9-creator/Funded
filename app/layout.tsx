import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Funded | Demo Trading Terminal",
  description: "A virtual-balance market learning simulator. No real-money trading."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}