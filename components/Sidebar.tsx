"use client";
import React from "react";
import Image from "next/image";
import SidebarUserInfo from "./SidebarUserInfo";
import TrendingNews from "./TrendingNews";

export default function Sidebar() {
  return (
    <nav className="hidden sm:flex flex-col p-3 xl:ml-20 xl:mr-10 w-[280px]">
      <div className="relative flex flex-col items-start">
        {/* Header Row: Logo + Sensebook Button */}
        <div className="flex items-center space-x-3 py-3 w-full">
          <Image
            src="/assets/sblogotb.png"
            width={48}
            height={48}
            alt="Logo"
          />
          <button
            className="bg-[#C0BAB5] w-[120px] h-[40px] rounded-full text-white font-medium cursor-pointer shadow-md text-base"
            onClick={() => window.location.reload()}
          >
            Sensebook
          </button>
        </div>

        {/* User Info just below the header */}
        <div className="w-full mb-2">
          <SidebarUserInfo />
        </div>

        {/* Trending News Widget below user info */}
        <TrendingNews />
      </div>
    </nav>
  );
}
