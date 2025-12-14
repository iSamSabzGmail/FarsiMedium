import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'لینک الزامی است' }, { status: 400 });
    }

    // ۱. دانلود مقاله با استفاده از Jina (تبدیل سایت به متن تمیز)
    // این سرویس عالیه و نیاز به پروکسی نداره چون سرور ورسل صداش میزنه
    const jinaUrl = `https://r.jina.ai/${url}`;
    const articleRes = await fetch(jinaUrl, {
      headers: {
        'X-No-Cache': 'true',
        'Accept': 'application/json' // درخواست جیسون برای دیتای تمیزتر
      }
    });

    if (!articleRes.ok) {
      throw new Error('دانلود مقاله انجام نشد. شاید لینک خراب است.');
    }

    const articleData = await articleRes.json();
    const articleText = articleData.data?.content || articleData.text || ''; // متن مقاله

    if (articleText.length < 100) {
      throw new Error('متن مقاله خیلی کوتاه است یا قفل شده است.');
    }

    // ۲. ارسال به Gemini برای ترجمه و فرمت‌دهی
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error('کلید Gemini تنظیم نشده است');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a professional Persian tech editor.
      Task: Rewrite this article for a Persian blog based on the provided text.
      
      Rules:
      1. Language: Fluent, modern Persian (Farsi). NO Google Translate style.
      2. Tone: Educational and engaging.
      3. Structure: Use Markdown (# Title, ## Subtitle, - List).
      4. Output: ONLY a valid JSON object.

      JSON Fields:
      - title: Catchy Persian title.
      - slug: English slug (kebab-case).
      - summary: 2-3 lines Persian summary.
      - content: The rewritten article body in Markdown. Add "Source: [Link]" at the end.
      - category: One of [تکنولوژی, توسعه فردی, هوش مصنوعی, استارتاپ, برنامه‌نویسی].
      - read_time: e.g. "۵ دقیقه".
      - cover_url: Find a relevant Unsplash image URL based on the topic.
      - source_url: "${url}".
      
      Article Content (Markdown):
      ${articleText.substring(0, 20000)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // تمیز کردن JSON
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'خطای سرور' }, { status: 500 });
  }
}