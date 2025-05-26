"use client";

import { EllipsisHorizontalIcon, MagnifyingGlassPlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface TrendingItem {
  title: string;
  source: string;
  url: string;
}

export default function Widgets() {
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(
          `https://newsapi.org/v2/top-headlines?language=en&pageSize=5&apiKey=${process.env.NEXT_PUBLIC_NEWSAPI_KEY}`
        );
        const data = await res.json();
        if (data.status === "ok") {
          const headlines = data.articles.map((item: any) => ({
            title: item.title,
            source: item.source.name,
            url: item.url,
          }));
          setTrending(headlines);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch trending news:", err);
        setError(true);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="p-3 hidden lg:flex flex-col space-y-4 w-[400px] ps-10">
      {/* Search Bar */}
      <div className="bg-[#EFF3F4] text-[#89959D] h-[44px] flex items-center space-x-3 rounded-full pl-5">
        <MagnifyingGlassPlusIcon className="w-[20px] h-[20px]" />
        <input type="text" placeholder="Search" className="bg-transparent outline-none" />
      </div>

      {/* What's Happening Section */}
      <div className="bg-[#EFF3F4] rounded-xl p-3">
        <h1 className="text-x1 font-bold mb-2">What's Happening</h1>

        {error ? (
          <p className="text-sm text-red-500">Failed to load news. Please try again later.</p>
        ) : trending.length === 0 ? (
          <p className="text-sm text-gray-500">Loading trends...</p>
        ) : (
          trending.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col py-3 space-y-0.5 hover:bg-[#dce2e4] rounded-lg px-2 transition"
            >
              <div className="flex justify-between text-[#536471] text-[13px]">
                <span>Trending</span>
                <EllipsisHorizontalIcon className="w-[20px]" />
              </div>
              <span className="font-bold text-sm truncate">#{item.title.split(" ")[0]}</span>
              <span className="text-[#536371] text-xs">{item.source}</span>
            </a>
          ))
        )}
      </div>

      {/* Who to Follow Section */}
      <div className="bg-[#EFF3F4] rounded-xl p-3">
        <h1 className="text-x1 font-bold mb-2">Who to follow</h1>

        {/* Elon Musk */}
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-3">
            <Image
              src={"/assets/elon-smirk.jpg"}
              width={56}
              height={56}
              alt="Profile Picture of Elon"
              className="w-14 h-14 rounded-full"
            />
            <div className="flex flex-col ml-3">
              <span className="font-bold">Elon Musk</span>
              <span>@iamelon</span>
            </div>
          </div>
          <button className="bg-[#0F1419] text-white w-[72px] h-[40px] rounded-full text-sm">
            follow
          </button>
        </div>

        {/* Naresh Mandla */}
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-3">
            <Image
              src={"/assets/nareshpro.jpg"}
              width={56}
              height={56}
              alt="Profile Picture of Naresh"
              className="w-14 h-14 rounded-full"
            />
            <div className="flex flex-col ml-3">
              <span className="font-bold">Naresh Mandla</span>
              <span>@thenareshm</span>
            </div>
          </div>
          <button className="bg-[#0F1419] text-white w-[72px] h-[40px] rounded-full text-sm">
            follow
          </button>
        </div>

        {/* Kendall Jenner */}
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-3">
            <Image
              src={"/assets/kendallj.jpg"}
              width={56}
              height={56}
              alt="Profile Picture of Kendall"
              className="w-14 h-14 rounded-full"
            />
            <div className="flex flex-col ml-3">
              <span className="font-bold">Kendall Jenner</span>
              <span>@Kendalljenner</span>
            </div>
          </div>
          <button className="bg-[#0F1419] text-white w-[72px] h-[40px] rounded-full text-sm">
            follow
          </button>
        </div>
      </div>
    </div>
  );
}
