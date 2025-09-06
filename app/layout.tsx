import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/redux/StoreProvider";
import { APP } from "@/src/lib/appConfig";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP.name,
  description: `${APP.name} - A sensible social discussion app on what's happening and how it makes sense into the future world.`,
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
