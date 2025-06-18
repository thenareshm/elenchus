"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Link from "next/link";

export default function Footer() {
  const user = useSelector((state: RootState) => state.user);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user.username) return;
    const sidebar = document.getElementById("sidebar-root");
    const widgets = document.getElementById("widgets-root");

    function getThreshold() {
      const sidebarBottom = sidebar ? sidebar.offsetTop + sidebar.offsetHeight : 0;
      const widgetsBottom = widgets ? widgets.offsetTop + widgets.offsetHeight : 0;
      return Math.max(sidebarBottom, widgetsBottom) + 20;
    }

    function handleScroll() {
      const threshold = getThreshold();
      const bottom = window.scrollY + window.innerHeight;
      if (bottom >= threshold) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }
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
      className={`${
        visible ? "fixed" : "hidden"
      } bottom-0 left-0 right-0 bg-white bg-opacity-90 backdrop-blur-sm border-t border-gray-200 z-50`}
    >
      <div className="max-w-2xl mx-auto py-3 px-5 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        <div className="flex space-x-4 text-[#C0BAB5] font-medium">
          <Link href="https://www.buymeacoffee.com/sensebook" target="_blank">BuyMeACoffee</Link>
          <Link href="https://discord.com" target="_blank">Discord</Link>
          <Link href="https://twitter.com" target="_blank">X</Link>
        </div>
        <div className="text-gray-600 text-center">
          © 2025 Sensebook. All Rights Reserved.
          <br className="sm:hidden" />
          Designed and Developed by {" "}
          <Link
            href="https://www.linkedin.com/in/nareshmandla"
            target="_blank"
            className="hover:underline text-[#C0BAB5]"
          >
            Naresh Mandla
          </Link>{" "}
          🌿🧠❤️
        </div>
      </div>
    </footer>
  );
}
