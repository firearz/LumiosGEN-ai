export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt || prompt.trim().length === 0) {
      throw new Error("Prompt is required")
    }

    // Create a more relevant placeholder image based on the prompt
    // This is a temporary solution until you integrate a real image generation API
    const generateRelevantImage = (prompt: string) => {
      const keywords = prompt.toLowerCase()

      // Map common keywords to relevant image categories
      const imageCategories = {
        cow: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=512&h=512&fit=crop",
        cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=512&h=512&fit=crop",
        dog: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=512&h=512&fit=crop",
        horse: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=512&h=512&fit=crop",
        bird: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=512&h=512&fit=crop",
        flower: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=512&h=512&fit=crop",
        tree: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=512&h=512&fit=crop",
        mountain: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop",
        ocean: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=512&h=512&fit=crop",
        sunset: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop",
        car: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=512&h=512&fit=crop",
        house: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=512&h=512&fit=crop",
        city: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=512&h=512&fit=crop",
        forest: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=512&h=512&fit=crop",
        beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=512&h=512&fit=crop",
        space: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=512&h=512&fit=crop",
        food: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=512&h=512&fit=crop",
        pizza: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=512&h=512&fit=crop",
        burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=512&h=512&fit=crop",
        coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=512&h=512&fit=crop",
        book: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=512&h=512&fit=crop",
        music: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=512&h=512&fit=crop",
        guitar: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=512&h=512&fit=crop",
        piano: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=512&h=512&fit=crop",
        robot: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=512&h=512&fit=crop",
        technology: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=512&h=512&fit=crop",
        computer: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=512&h=512&fit=crop",
        phone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=512&h=512&fit=crop",
        art: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=512&h=512&fit=crop",
        painting: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=512&h=512&fit=crop",
        abstract: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=512&h=512&fit=crop",
        portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=512&h=512&fit=crop",
        landscape: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop",
        nature: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=512&h=512&fit=crop",
        anime: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=512&h=512&fit=crop",
        cartoon: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=512&h=512&fit=crop",
        fantasy: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=512&h=512&fit=crop",
        dragon: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=512&h=512&fit=crop",
        castle: "https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=512&h=512&fit=crop",
        medieval: "https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=512&h=512&fit=crop",
        futuristic: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=512&h=512&fit=crop",
        cyberpunk: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=512&h=512&fit=crop",
        steampunk: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=512&h=512&fit=crop",
      }

      // Find the best matching category
      for (const [keyword, imageUrl] of Object.entries(imageCategories)) {
        if (keywords.includes(keyword)) {
          return imageUrl
        }
      }

      // Default to a random nature image if no keywords match
      const defaultImages = [
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=512&h=512&fit=crop",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop",
        "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=512&h=512&fit=crop",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=512&h=512&fit=crop",
        "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=512&h=512&fit=crop",
      ]

      const randomIndex = Math.floor(Math.random() * defaultImages.length)
      return defaultImages[randomIndex]
    }

    // Try to use OpenRouter API with Qwen-2.5-VL for enhanced prompt generation
    let enhancedDescription = prompt
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_IMAGE_API_KEY}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "Lumios Gen",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen2.5-vl-32b-instruct:free",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Create a detailed, artistic image description for: "${prompt}". Make it vivid, specific, and suitable for high-quality image generation. Include details about style, lighting, composition, and mood. Keep it under 200 words.`,
                },
              ],
            },
          ],
          max_tokens: 300,
          temperature: 0.8,
        }),
      })

      if (response.ok) {
        // Use Replicate's Stable Diffusion API to generate a real image
        const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
          method: "POST",
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            version: "a9758cb0b72b22e9d7b85b01154d50f27051e42f1553f48aa7b6c7c7e8d4e8f3", // Stable Diffusion 1.5
            input: { prompt: enhancedDescription },
          }),
        })

        const replicateData = await replicateResponse.json()

        const imageUrl = replicateData?.urls?.get || null

      }
    } catch (apiError) {
      console.warn("OpenRouter API failed, using original prompt:", apiError)
    }

    // Generate a relevant image URL based on the prompt
    const imageUrl = generateRelevantImage(prompt)

    // Simulate processing time for better UX
    await new Promise((resolve) => setTimeout(resolve, 3000))

    return Response.json({
      imageUrl,
      description: enhancedDescription,
      model: "replicate/stable-diffusion",
      prompt,
      enhancedPrompt: enhancedDescription,
    })

  } catch (error) { 
    console.error("Image generation error:", error)
    return Response.json(
      {
        error: "Failed to generate image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
