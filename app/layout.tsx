import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/redux/StoreProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sensebook",
  description: "Sensebook - A sensible social dicussion app on what's happening and how it make sense into the future world.",
  icons: {
    icon: [
      { url: '/sblogotb.png', type: 'image/png' },
      { url: '/sblogotb.ico', type: 'image/x-icon' }
    ],
    shortcut: [
      { url: '/sblogotb.png', type: 'image/png' },
      { url: '/sblogotb.ico', type: 'image/x-icon' }
    ],
    apple: [
      { url: '/sblogotb.png', type: 'image/png' }
    ],
    other: [
      {
        rel: 'icon',
        url: '/sblogotb.png',
        type: 'image/png'
      }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
      <html lang="en">
        <head>
          <link rel="icon" type="image/png" href="/sblogotb.png" />
          <link rel="icon" type="image/x-icon" href="/sblogotb.ico" />
          <link rel="shortcut icon" type="image/png" href="/sblogotb.png" />
        </head>
        <body className={inter.className}>{children}</body>
      </html>
    </StoreProvider>
  );
}
