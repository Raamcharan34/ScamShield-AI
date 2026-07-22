export async function POST(request: Request) {
  try {
    const { message, image } = await request.json();

    const userContent: Array<
      | {
          type: "text";
          text: string;
        }
      | {
          type: "image_url";
          image_url: {
            url: string;
          };
        }
    > = [];

    if (message && message.trim() !== "") {
      userContent.push({
        type: "text",
        text: message,
      });
    }

    if (image) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: image,
        },
      });
    }
console.log({
  exists: !!process.env.OPENROUTER_API_KEY,
  length: process.env.OPENROUTER_API_KEY?.length,
  first15: process.env.OPENROUTER_API_KEY?.substring(0, 15),
});
throw new Error("RC DEBUG TEST");
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3002",
          "X-Title": "ScamShield AI",
        },

        body: JSON.stringify({
          model: "google/gemini-2.5-flash",

          messages: [
            {
              role: "system",
              content: `
You are ScamShield AI.

You analyze BOTH:

1. Text messages
2. Screenshots of scam messages

If an image is uploaded, carefully read every visible word inside it before answering.

Return ONLY in this exact format:

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
`,
            },

            {
              role: "user",
              content: userContent,
            },
          ],

          temperature: 0.2,
          max_tokens: 500,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
  console.log("OPENROUTER ERROR:", data);

  return Response.json({
    result: JSON.stringify(data, null, 2),
  });
}

    return Response.json({
      result:
        data.choices?.[0]?.message?.content ??
        "No response received from AI.",
    });
  } catch (error: unknown) {
    console.error(error);

    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return Response.json({
      result: message,
    });
  }
}