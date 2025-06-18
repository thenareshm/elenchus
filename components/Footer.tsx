"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function Footer() {
  const user = useSelector((state: RootState) => state.user);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user.username) return;

    const handler = () => {
      const sidebar = document.getElementById("sidebar");
      const widgets = document.getElementById("widgets");

      const sidebarBottom = sidebar
        ? sidebar.getBoundingClientRect().bottom + window.scrollY
        : 0;
      const widgetsBottom = widgets
        ? widgets.getBoundingClientRect().bottom + window.scrollY
        : 0;

      const triggerPoint = Math.max(sidebarBottom, widgetsBottom);
      const scrolledBottom = window.scrollY + window.innerHeight;

      setVisible(scrolledBottom > triggerPoint);
    };

    handler();
    window.addEventListener("scroll", handler);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, [user.username]);

  if (!user.username || !visible) return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center bg-white/90 backdrop-blur-sm border-t border-gray-200 py-3 text-center">
      <div className="flex space-x-6 text-sm">
        <a
          href="https://www.buymeacoffee.com/nareshmandla"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-[#C0BAB5]"
        >
          BuyMeACoffee
        </a>
        <a
          href="https://discord.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-[#C0BAB5]"
        >
          Discord
        </a>
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-[#C0BAB5]"
        >
          X
        </a>
      </div>
      <div className="mt-2 text-xs text-gray-500 leading-tight">
        © 2025 Sensebook. All Rights Reserved.
        <br />
        Designed and Developed by{' '}
        <a
          href="https://www.linkedin.com/in/nareshmandla"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Naresh Mandla
        </a>{' '}
        🌿🧠❤️
      </div>
    </footer>
  );
}
