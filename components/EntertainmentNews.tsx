"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { openWebsiteModal, setWebsiteUrl } from '@/redux/slices/modalSlice';
import TiltedCard from './TiltedCard';

interface EntertainmentArticle {
  title: string;
  description?: string;
  url: string;
  source: { name: string };
}

export default function EntertainmentNews() {
  const [entertainmentNews, setEntertainmentNews] = useState<EntertainmentArticle[]>([]);
  const [error, setError] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchEntertainmentNews = async () => {
      try {
        const res = await fetch("/api/gnews-entertainment");
        const data = await res.json();
        if (Array.isArray(data)) {
          setEntertainmentNews(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch entertainment news:", err);
        setError(true);
      }
    };
    fetchEntertainmentNews();
  }, []);

  function toHashtag(str: string) {
    if (!str) return '';
    const match = str.match(/\b([A-Z][a-zA-Z0-9]*)\b/);
    return match ? `#${match[1]}` : `#${str.split(' ')[0]}`;
  }

  const handleArticleClick = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(setWebsiteUrl(url));
    dispatch(openWebsiteModal());
  };

  return (
    <div className="bg-[#EFF3F4] rounded-xl p-4">
      <h1 className="text-xl font-bold mb-4">Entertainment</h1>
      {error ? (
        <p className="text-sm text-red-500">Failed to load entertainment news. Please try again later.</p>
      ) : entertainmentNews.length === 0 ? (
        <p className="text-sm text-gray-500">Loading entertainment news...</p>
      ) : (
        <ul className="space-y-3">
          {entertainmentNews.map((item, idx) => (
            <li key={item.url + idx}>
              <TiltedCard
                containerHeight="auto"
                containerWidth="100%"
                imageHeight="auto"
                imageWidth="100%"
                scaleOnHover={1.05}
                rotateAmplitude={8}
                showMobileWarning={false}
                showTooltip={false}
              >
                <div
                  className="block rounded-xl p-3 hover:bg-gray-200 transition cursor-pointer"
                  onClick={(e) => handleArticleClick(item.url, e)}
                >
                  <div className="font-bold text-[15px] text-gray-900 leading-tight">
                    {toHashtag(item.title)}
                  </div>
                  <div className="block text-[15px] font-normal text-gray-900 mt-1" style={{ wordBreak: "break-word" }}>
                    {item.title}
                  </div>
                  {item.description && (
                    <div className="text-xs text-gray-600 mt-1 leading-tight">{item.description}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">{item.source?.name}</div>
                </div>
              </TiltedCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}