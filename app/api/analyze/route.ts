import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message, image } = await req.json();

    const parts: any[] = [];

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
      prompt += `\n\nText:\n${message}`;
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
      model: "gemini-2.5-flash",
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
  } catch (error: any) {
    console.error(error);

    return Response.json({
      result: error.message,
    });
  }
}