import OpenAI from "openai";

function getClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey:  process.env.OPENROUTER_API_KEY ?? "placeholder",
  });
}

const MODEL = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateInsights(stockName: string, symbol: string, data: any): Promise<string> {
  const prompt = `You are a professional quantitative analyst. Based on the following factual data for ${stockName} (${symbol}), generate a concise, objective, data-driven research note.

STRICT RULES:
- NEVER use words: Buy, Sell, Hold, Avoid, Recommend, Strong Buy, Weak, Bullish outlook, Bearish outlook
- Only state observable facts and calculated metrics
- Use neutral language: "The RSI indicates...", "The moving averages show...", "Historically..."
- Be precise, professional, and factual
- Structure with sections: Technical Observations, Fundamental Summary, Risk Metrics, Historical Context

Data:
${JSON.stringify(data, null, 2)}

Generate a 400-600 word professional research note:`;

  const response = await getClient().chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 800,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content ?? "Insufficient data to generate insights.";
}
