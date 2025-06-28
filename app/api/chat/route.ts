export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENROUTER_CHAT_API_KEY;
    const referer = process.env.NEXT_PUBLIC_SITE_URL || "https://lumios-gen-ai.vercel.app/";

    if (!apiKey) {
      console.error("❌ Missing OPENROUTER_CHAT_API_KEY");
      return new Response(JSON.stringify({ error: "API key not found." }), { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": referer,
        "X-Title": "Lumios Gen - Daily Chat",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful, friendly AI assistant for daily conversations.",
          },
          ...messages,
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ OpenRouter API Error:", data);
      return new Response(JSON.stringify({ error: data.error || "Unknown error" }), {
        status: response.status,
      });
    }

    return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
      status: 200,
    });
  } catch (err) {
    console.error("❌ Unexpected Server Error:", err);
    return new Response(JSON.stringify({ error: "Unexpected server error." }), { status: 500 });
  }
}
