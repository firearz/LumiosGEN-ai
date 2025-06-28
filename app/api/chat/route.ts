export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // API key is securely stored on server-side only
    const apiKey = process.env.OPENROUTER_CHAT_API_KEY

    if (!apiKey) {
      throw new Error("Chat API key not configured")
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://lumios-gen-ai.vercel.app",
        "X-Title": "Lumios Gen - Daily Chat",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat:free",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful, friendly AI assistant for daily conversations. Keep responses conversational, helpful, and engaging. You're designed for casual chats, quick questions, and everyday assistance. Be concise but warm in your responses. Use emojis occasionally to make conversations more lively.",
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
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
    console.error("Chat API error:", error)
    return Response.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
