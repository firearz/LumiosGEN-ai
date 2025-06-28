export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // API key is securely stored on server-side only
    const apiKey = process.env.OPENROUTER_RESEARCH_API_KEY

    if (!apiKey) {
      throw new Error("Research API key not configured")
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Lumios Gen - Research Mode",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat:free",
        messages: [
          {
            role: "system",
            content:
              "You are an advanced AI research assistant specialized in providing comprehensive, detailed, and analytical responses. Your role is to conduct thorough research, provide in-depth analysis, and offer well-structured information on complex topics. Always provide detailed explanations, cite reasoning, break down complex concepts, and offer multiple perspectives when relevant. Structure your responses clearly with headings, bullet points, or numbered lists when appropriate. Focus on accuracy, depth, and educational value. Be scholarly and professional in your approach.",
          },
          ...messages,
        ],
        temperature: 0.3,
        max_tokens: 2500,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()

    return Response.json({
      content: data.choices[0].message.content,
    })
  } catch (error) {
    console.error("Research API error:", error)
    return Response.json({ error: "Failed to process research request" }, { status: 500 })
  }
}
