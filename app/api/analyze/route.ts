import Groq from "groq-sdk";

const ai = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
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
You are ScamShield AI, an AI-powered cybersecurity assistant.

Your task is to analyze the provided text and/or screenshot for signs of scams, phishing, fraud, impersonation, fake job offers, fake lotteries, fake banking alerts, malicious links, social engineering, or suspicious behavior.

IMPORTANT:
Assign the scam risk carefully using the following scoring guide.

Scam Risk Scale:

0–20%
• Clearly legitimate.
• Official communication.
• No suspicious links.
• No urgency.
• No request for personal information.

21–40%
• Mostly safe.
• Generic wording.
• Unknown sender.
• Slightly suspicious link.
• No sensitive information requested.

41–60%
• Moderately suspicious.
• Unknown website.
• Fake-looking offers.
• Mild urgency.
• Suspicious wording.
• Possible phishing attempt.

61–80%
• Highly suspicious.
• Fake rewards.
• Fake customer support.
• Urgent account verification.
• Requests personal details.
• Suspicious domains.

81–100%
• Almost certainly a scam.
• Requests OTP, passwords, bank details, Aadhaar, PAN, UPI PIN.
• Threatens account suspension.
• Demands payment.
• Crypto investment scam.
• Lottery scam.
• Gift card scam.
• Romance scam.
• Government impersonation.
• Banking impersonation.

While analyzing consider:

✔ Urgency
✔ Emotional manipulation
✔ Fake rewards
✔ Suspicious links
✔ Unknown domains
✔ Requests for money
✔ Requests for OTP
✔ Requests for passwords
✔ Requests for Aadhaar/PAN
✔ Grammar mistakes
✔ Brand impersonation
✔ Fake customer support
✔ Social engineering tactics

Return ONLY in the following format.

🚨 Scam Risk: XX%

✅ Verdict:
Safe / Suspicious / Scam

📌 Reason:
Explain in 2–4 simple sentences why you assigned this score.

⚠️ Warning Signs:
- Point 1
- Point 2
- Point 3

💡 Advice:
Give 3 practical safety tips for the user.
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

  const response = await ai.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "user",
      content: [
        ...parts.map((part) => {
          if (part.text) {
            return {
              type: "text" as const,
              text: part.text,
            };
          }

          return {
            type: "image_url" as const,
            image_url: {
              url: `data:${part.inlineData!.mimeType};base64,${part.inlineData!.data}`,
            },
          };
        }),
      ],
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