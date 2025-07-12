import { NextResponse } from 'next/server';

let cache: unknown[] | null = null;
let lastFetch = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hour in ms

export async function GET() {
  const now = Date.now();

  try {
    if (!cache || now - lastFetch > CACHE_DURATION) {
      const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
      const url = `https://gnews.io/api/v4/top-headlines?token=${GNEWS_API_KEY}&topic=world&lang=en&max=8`;
      const res = await fetch(url);
      const data = await res.json();

      // Defensive log
      console.log("[GNews API DEBUG]", JSON.stringify(data, null, 2));

      if (Array.isArray(data.articles)) {
        cache = data.articles;
      } else {
        cache = [];
      }
      lastFetch = now;
    }
    return NextResponse.json(cache);
  } catch (e) {
    console.error("GNews route error:", e);
    return NextResponse.json([], { status: 500 });
  }
}
