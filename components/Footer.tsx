"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function Footer() {
  const user = useSelector((state: RootState) => state.user);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user.username) return;

    const handleScroll = () => {
      if (visible) return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;
      if (scrollPosition >= pageHeight) {
        setVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [user.username, visible]);

  if (!user.username || !visible) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#C0BAB5] bg-opacity-90 text-white px-4 py-3 flex flex-col items-center space-y-2 z-50">
      <div className="flex space-x-4 text-sm">
        <Link href="https://www.buymeacoffee.com/nareshmandla" target="_blank" rel="noopener noreferrer" className="hover:underline">
          BuyMeACoffee
        </Link>
        <Link href="https://twitter.com/nareshmandla" target="_blank" rel="noopener noreferrer" className="hover:underline">
          Twitter
        </Link>
        <Link href="https://www.linkedin.com/in/nareshmandla" target="_blank" rel="noopener noreferrer" className="hover:underline">
          LinkedIn
        </Link>
      </div>
      <p className="text-xs text-center">
        © 2025 Sensebook. All Rights Reserved.
        <br />
        Designed and Developed by{' '}
        <Link href="https://www.linkedin.com/in/nareshmandla" target="_blank" rel="noopener noreferrer" className="underline">
          Naresh Mandla
        </Link>{' '}
        🌿🧠❤️
      </p>
    </footer>
  );
}
