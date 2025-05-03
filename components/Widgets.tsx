import { EllipsisHorizontalIcon, MagnifyingGlassIcon, MagnifyingGlassPlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import React from "react";

export default function Widgets() {
  return (
    <div className="p-3  hidden lg:flex flex-col space-y-4 w-[400px] ps-10">
      <div className="bg-[#EFF3F4] text-[#89959D] h-[44px] flex items-center space-x-3 rounded-full pl-5">
        <MagnifyingGlassPlusIcon className="w-[20px] h-[20px]" />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent outline-none"
        />
      </div>

      <div className="bg-[#EFF3F4] rounded-xl p-3">
        <h1 className="text-x1 font-bold mb-2">
          What's Happening
        </h1>
        
        {/* Trending sections */}
        <div className="flex flex-col py-3 space-y-0.5">
            <div className="flex justify-between text-[#536471] text-[13px]">
                <span>Trending in World</span>
                <EllipsisHorizontalIcon className="w-[20px]"/>
            </div>
            <span className="font-bold text-sm">#GlobalWarming</span>
            <span className="text-[#536371] text-xs">320K Tweets</span>
        </div>
        <div className="flex flex-col py-3 space-y-0.5">
            <div className="flex justify-between text-[#536471] text-[13px]">
                <span>Trending in Asia</span>
                <EllipsisHorizontalIcon className="w-[20px]"/>
            </div>
            <span className="font-bold text-sm">#AIvshumans</span>
            <span className="text-[#536371] text-xs">120K Tweets</span>
        </div>
        <div className="flex flex-col py-3 space-y-0.5">
            <div className="flex justify-between text-[#536471] text-[13px]">
                <span>Trending in USA</span>
                <EllipsisHorizontalIcon className="w-[20px]"/>
            </div>
            <span className="font-bold text-sm">#SpacexBeatsNASA</span>
            <span className="text-[#536371] text-xs">80K Tweets</span>
        </div>
        <div className="flex flex-col py-3 space-y-0.5">
            <div className="flex justify-between text-[#536471] text-[13px]">
                <span>Trending in USA</span>
                <EllipsisHorizontalIcon className="w-[20px]"/>
            </div>
            <span className="font-bold text-sm">#UnbanTiktok</span>
            <span className="text-[#536371] text-xs">30K Tweets</span>
        </div>
        {/* ... repeated trending sections ... */}
      </div>
      
      <div className="bg-[#EFF3F4] rounded-xl p-3">
        <h1 className="text-x1 font-bold mb-2">Who to follow</h1>

        <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-3">
                <Image
                  src={'/assets/elon-smirk.jpg'}
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
        <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-3">
                <Image
                  src={'/assets/nareshpro.jpg'}
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
        <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-3">
                <Image
                  src={'/assets/kendallj.jpg'}
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