// app/api/news/route.ts

export async function GET() {
    const apiKey = process.env.NEXT_PUBLIC_NEWSAPI_KEY;
  
    const res = await fetch(`https://newsapi.org/v2/top-headlines?language=en&pageSize=5&apiKey=${apiKey}`);
  
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch news" }), {
        status: 500,
      });
    }
  
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  