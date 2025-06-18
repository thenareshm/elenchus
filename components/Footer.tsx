"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function Footer() {
  const user = useSelector((state: RootState) => state.user);
  const [visible, setVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
  const [overlay, setOverlay] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // initialize theme from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      }
    } catch (e) {}
  }, []);

  // start 25 minute timer when user logs in
  useEffect(() => {
    if (!user.username) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setOverlay(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [user.username]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    try {
      localStorage.setItem("theme", newTheme);
    } catch (e) {}
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

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

  if (!user.username) {
    return null;
  }

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  return (
    <>
      {overlay && (
        <div className="fixed top-5 inset-x-0 flex justify-center z-50">
          <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded-md shadow-lg max-w-md text-center">
            You achieved a flow-state of being sensible. That’s good for today. Please come back later and continue your journey of becoming more sensible.
          </div>
        </div>
      )}
      {visible && (
        <footer className="fixed bottom-0 left-0 w-full bg-[#C0BAB5] bg-opacity-90 text-white px-4 py-3 flex flex-col items-center space-y-2 z-50">
          <div className="flex items-center justify-between w-full max-w-xs">
            <span className="text-sm font-mono">
              {minutes}:{seconds}
            </span>
            <button onClick={toggleTheme} aria-label="Toggle theme" className="text-xl">
              {theme === 'light' ? '🌞' : '🌚'}
            </button>
          </div>
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
      )}
    </>
  );
}
