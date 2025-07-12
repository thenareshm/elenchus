'use client';
import React, { useEffect, useState } from 'react';

interface Article {
  title: string;
  description?: string;
  url: string;
  source: { name: string };
}

// === Set your card width here! (e.g., '340px', '380px', '100%' etc) ===
const cardWidth = '450px';

export default function TrendingNews() {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/gnews')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNews(data);
        else setNews([]);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch news.');
        setNews([]);
        setLoading(false);
      });
  }, []);

  function toHashtag(str: string) {
    if (!str) return '';
    // Take first word or first capitalized word for hashtag
    const match = str.match(/\b([A-Z][a-zA-Z0-9]*)\b/);
    return match ? `#${match[1]}` : `#${str.split(' ')[0]}`;
  }

  return (
    <div
      className="bg-gray-100 rounded-2xl shadow p-4 mt-4"
      style={{ width: cardWidth, maxWidth: '100%' }}
    >
      <h2 className="font-bold text-xl mb-4 text-gray-900">What&apos;s Happening</h2>
      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : news.length === 0 ? (
        <div className="text-sm text-gray-400">No news found.</div>
      ) : (
        <ul className="space-y-3">
          {news.map((article, idx) => (
            <li key={article.url + idx}>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl p-3 hover:bg-gray-200 transition"
                style={{ textDecoration: 'none' }}
              >
                <div className="font-bold text-[15px] text-gray-900 leading-tight">
                  {toHashtag(article.title)}
                </div>
                <div
                  className="block text-[15px] font-normal text-gray-900 mt-1"
                  style={{ wordBreak: "break-word" }}
                >
                  {article.title}
                </div>
                {article.description && (
                  <div className="text-xs text-gray-600 mt-1 leading-tight">{article.description}</div>
                )}
                <div className="text-xs text-gray-500 mt-1">{article.source?.name}</div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
