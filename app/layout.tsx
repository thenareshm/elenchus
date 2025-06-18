import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/redux/StoreProvider";
import Script from "next/script";

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
       <body className={`${inter.className} transition-colors duration-300`}>
         {children}
         <Script id="theme-init" strategy="beforeInteractive">
           {`(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`}
         </Script>
       </body>
      </html>
    </StoreProvider>

  );
}
