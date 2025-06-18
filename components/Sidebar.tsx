"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { openSignUpModal } from "@/redux/slices/modalSlice";
import SidebarUserInfo from "./SidebarUserInfo";
import TrendingNews from "./TrendingNews";

export default function Sidebar() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const handleSensebookClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default button behavior
    if (!user.username) {
      dispatch(openSignUpModal());
    }
  };

  return (
    <nav id="sidebar" className="hidden sm:flex flex-col p-3 xl:ml-20 xl:mr-10 w-[280px]">
      <div className="relative flex flex-col items-start">
        {/* Header Row: Logo + Sensebook Button */}
        <div className="flex items-center space-x-3 py-3 w-full">
          <Link href="/" onClick={(e) => !user.username && e.preventDefault()}>
            <Image
              src="/assets/sblogotb.png"
              width={48}
              height={48}
              alt="Logo"
            />
          </Link>
          <button
            className="bg-[#C0BAB5] w-[120px] h-[40px] rounded-full text-white font-medium shadow-md text-base"
            onClick={handleSensebookClick}
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
