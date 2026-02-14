// OpenAI Food Analysis Service

interface FoodAnalysis {
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export async function analyzeFoodWithAI(
    apiKey: string,
    userInput: string
): Promise<FoodAnalysis> {
    if (!apiKey) {
        throw new Error('OpenAI API key not configured. Go to Settings to add it.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a nutrition analysis assistant. When given a food description, estimate the nutritional content. Return a JSON object with exactly these fields:
- description: a clean, standardized name for the food item
- calories: estimated calories (number)
- protein: grams of protein (number)
- carbs: grams of carbohydrates (number)
- fat: grams of fat (number)

Be reasonable with portion sizes. If the user doesn't specify a quantity, assume a typical single serving. Always return valid JSON only, no other text.`,
                },
                {
                    role: 'user',
                    content: userInput,
                },
            ],
            temperature: 0.3,
            max_tokens: 200,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
            `OpenAI API error: ${(error as Record<string, { message?: string }>).error?.message || response.statusText}`
        );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('No response from AI');
    }

    try {
        // Strip markdown code block if present
        const cleaned = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned) as FoodAnalysis;

        return {
            description: parsed.description || userInput,
            calories: Math.round(parsed.calories || 0),
            protein: Math.round(parsed.protein || 0),
            carbs: Math.round(parsed.carbs || 0),
            fat: Math.round(parsed.fat || 0),
        };
    } catch {
        throw new Error('Failed to parse AI response');
    }
}
