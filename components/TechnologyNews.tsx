'use client';
import React, { useEffect, useState } from 'react';

interface TechArticle {
  title: string;
  description?: string;
  url: string;
  source: { name: string };
}

export default function TechnologyNews() {
  const [techNews, setTechNews] = useState<TechArticle[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTechNews = async () => {
      try {
        const res = await fetch("/api/gnews-tech");
        const data = await res.json();
        if (Array.isArray(data)) {
          setTechNews(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch tech news:", err);
        setError(true);
      }
    };
    fetchTechNews();
  }, []);

  function toHashtag(str: string) {
    if (!str) return '';
    const match = str.match(/\b([A-Z][a-zA-Z0-9]*)\b/);
    return match ? `#${match[1]}` : `#${str.split(' ')[0]}`;
  }

  if (error) return null;
  if (techNews.length === 0) return null;

  return (
    <div className="bg-[#EFF3F4] rounded-xl p-4">
      <h1 className="text-xl font-bold mb-4">What&apos;s Trending Tech</h1>
      <ul className="space-y-3">
        {techNews.map((item, idx) => (
          <li key={item.url + idx}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl p-3 hover:bg-gray-200 transition"
              style={{ textDecoration: 'none' }}
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
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}