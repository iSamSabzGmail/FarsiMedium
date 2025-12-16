// app/api/extract/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'لینک الزامی است' }, { status: 400 });
    }

    // استفاده از Jina Reader برای استخراج متن
    const jinaUrl = `https://r.jina.ai/${url}`;

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'X-Return-Format': 'markdown'
    };
    
    // اگر در آینده کلید Jina گرفتی، اینجا اضافه کن
    if (process.env.JINA_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.JINA_API_KEY}`;
    }

    // درخواست مستقیم از سمت سرور (بدون مشکل CORS)
    const response = await fetch(jinaUrl, { headers });

    if (!response.ok) {
        // تلاش مجدد بدون هدر خاص اگر اولی خطا داد
        const retryResponse = await fetch(jinaUrl);
        if (!retryResponse.ok) {
             return NextResponse.json(
                { error: `خطا در دریافت مقاله: ${retryResponse.status}` }, 
                { status: retryResponse.status }
            );
        }
        const text = await retryResponse.text();
        return NextResponse.json({ text });
    }

    const text = await response.text();
    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}