// app/api/gnews-tech/route.ts
import { NextResponse } from 'next/server';

let cache: unknown[] | null = null;
let lastFetch = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  const now = Date.now();

  try {
    if (!cache || now - lastFetch > CACHE_DURATION) {
      const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
      // topic=technology for tech news
      const url = `https://gnews.io/api/v4/top-headlines?token=${GNEWS_API_KEY}&topic=technology&lang=en&max=5`;
      const res = await fetch(url);
      const data = await res.json();
      console.log("[GNews Tech API DEBUG]", JSON.stringify(data, null, 2));
      if (Array.isArray(data.articles)) {
        cache = data.articles;
      } else {
        cache = [];
      }
      lastFetch = now;
    }
    return NextResponse.json(cache);
  } catch (e) {
    console.error("GNews Tech route error:", e);
    return NextResponse.json([], { status: 500 });
  }
}
