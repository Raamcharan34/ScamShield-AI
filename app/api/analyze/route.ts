import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message, image } = await req.json();

    const parts: Array<{
      text?: string;
      inlineData?: {
        mimeType: string;
        data: string;
      };
    }> = [];

    let prompt = `
You are ScamShield AI.

Analyze the given text and/or screenshot.

Return ONLY in this format:

🚨 Scam Risk: XX%

✅ Verdict:
Safe or Scam

📌 Reason:
(Simple explanation)

⚠️ Warning Signs:
- Point 1
- Point 2
- Point 3

💡 Advice:
(Simple advice)
`;

    if (message && message.trim() !== "") {
      prompt += `

Text:
${message}`;
    }

    parts.push({
      text: prompt,
    });

    if (image) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: image.split(",")[1],
        },
      });
    }

    const response = await ai.models.generateContent({
  model: "gemini-2.5-flash-preview-05-20",
      contents: [
        {
          role: "user",
          parts,
        },
      ],
    });

    return Response.json({
      result: response.text,
    });
  } catch (error: unknown) {
    console.error(error);

    return Response.json({
      result:
        error instanceof Error
          ? error.message
          : "Unknown error occurred.",
    });
  }
}