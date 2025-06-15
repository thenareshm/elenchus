import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/redux/StoreProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sensebook",
  description: "Sensebook - A sensible social dicussion app on what’s happening and how it make sense into the future world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
      <html lang="en">
       <body className={inter.className}>{children}</body>
      </html>
    </StoreProvider>

  );
}
