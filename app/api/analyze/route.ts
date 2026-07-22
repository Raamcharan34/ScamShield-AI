import Groq from "groq-sdk";

const ai = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const prompt = `
You are ScamShield AI, an AI-powered cybersecurity assistant.

Your task is to analyze the provided text for signs of scams, phishing, fraud, impersonation, fake job offers, fake lotteries, fake banking alerts, malicious links, social engineering, or suspicious behavior.

Assign the scam risk carefully.

Scam Risk Scale:

0–20%
• Clearly legitimate.

21–40%
• Mostly safe.

41–60%
• Moderately suspicious.

61–80%
• Highly suspicious.

81–100%
• Almost certainly a scam.

Analyze this text:

${message}

Return ONLY in this format:

🚨 Scam Risk: XX%

✅ Verdict:
Safe / Suspicious / Scam

📌 Reason:
Explain in 2–4 simple sentences.

⚠️ Warning Signs:
- Point 1
- Point 2
- Point 3

💡 Advice:
Give 3 practical safety tips.
`;

    const response = await ai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return Response.json({
      result: response.choices[0]?.message?.content ?? "No response",
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