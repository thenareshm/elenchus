"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function Footer() {
  const user = useSelector((state: RootState) => state.user);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user.username) return;

    const sidebar = document.getElementById("sidebar");
    const widgets = document.getElementById("widgets");

    if (!sidebar || !widgets) return;

    const handleScroll = () => {
      const sidebarBottom = sidebar.offsetTop + sidebar.offsetHeight;
      const widgetsBottom = widgets.offsetTop + widgets.offsetHeight;
      const trigger = Math.max(sidebarBottom, widgetsBottom) + 20; // distance
      const scrolled = window.scrollY + window.innerHeight;
      setVisible(scrolled >= trigger);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [user.username]);

  if (!user.username) return null;

  return (
    <footer
      className={`fixed bottom-0 left-0 w-full z-30 transition-opacity duration-300 bg-white/80 backdrop-blur border-t border-gray-200 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div className="max-w-[1400px] mx-auto py-3 px-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
        <div className="flex space-x-4 mb-2 sm:mb-0">
          <a
            href="https://www.buymeacoffee.com/nareshmandla"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C0BAB5]"
          >
            BuyMeACoffee
          </a>
          <a
            href="https://discord.gg/nareshmandla"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C0BAB5]"
          >
            Discord
          </a>
          <a
            href="https://twitter.com/nareshmandla"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C0BAB5]"
          >
            X
          </a>
        </div>
        <div className="text-center sm:text-right">
          <p>© 2025 Sensebook. All Rights Reserved.</p>
          <p>
            Designed and Developed by{' '}
            <a
              href="https://www.linkedin.com/in/nareshmandla"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#C0BAB5] font-medium"
            >
              Naresh Mandla
            </a>{' '}
            <span role="img" aria-label="icons">🌿🧠❤️</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

