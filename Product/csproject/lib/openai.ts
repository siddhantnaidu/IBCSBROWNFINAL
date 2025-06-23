// Updated OpenAI service to handle image analysis
import OpenAI from "openai"

const openai = new OpenAI({
   apiKey: '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',
})

export interface Flashcard {
  id: string
  front: string
  back: string
}

export async function generateFlashcardsFromImage(base64Image: string): Promise<Flashcard[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use GPT-4 Vision model
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image of notes and create flashcards from the content. 
              
              Please extract key concepts, definitions, formulas, or important information and convert them into question-answer pairs suitable for studying.
              
              Return the flashcards in this exact JSON format:
              {
                "flashcards": [
                  {
                    "front": "Question or term",
                    "back": "Answer or definition"
                  }
                ]
              }
              
              Create between 5-15 flashcards depending on the content available. Focus on the most important information that would be useful for studying.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No response from OpenAI")
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid response format from OpenAI")
    }

    const parsed = JSON.parse(jsonMatch[0])

    if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
      throw new Error("Invalid flashcards format in response")
    }

    // Convert to our Flashcard format with IDs
    const flashcards: Flashcard[] = parsed.flashcards.map((card: any, index: number) => ({
      id: `card_${Date.now()}_${index}`,
      front: card.front || "",
      back: card.back || "",
    }))

    if (flashcards.length === 0) {
      throw new Error(
        "No flashcards could be generated from this image. Please ensure the image contains clear, readable text.",
      )
    }

    return flashcards
  } catch (error) {
    console.error("Error generating flashcards from image:", error)

    if (error instanceof Error) {
      throw new Error(`Failed to generate flashcards: ${error.message}`)
    }

    throw new Error("Failed to generate flashcards from image")
  }
}

// Keep the original text-based function as backup
export async function generateFlashcards(topic: string, count = 10): Promise<Flashcard[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that creates educational flashcards. Create clear, concise question-answer pairs that help students learn effectively.",
        },
        {
          role: "user",
          content: `Create ${count} flashcards about "${topic}". Return them in JSON format with this structure:
          {
            "flashcards": [
              {
                "front": "Question or term",
                "back": "Answer or definition"
              }
            ]
          }`,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No response from OpenAI")
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid response format")
    }

    const parsed = JSON.parse(jsonMatch[0])

    const flashcards: Flashcard[] = parsed.flashcards.map((card: any, index: number) => ({
      id: `card_${Date.now()}_${index}`,
      front: card.front,
      back: card.back,
    }))

    return flashcards
  } catch (error) {
    console.error("Error generating flashcards:", error)
    throw new Error("Failed to generate flashcards")
  }
}
