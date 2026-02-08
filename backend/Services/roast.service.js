import openai from "./OpenAi.service.js";

export async function generateRoast(profile) {
  try {
    const response = await openai.chat.completions.create({
      model:"llama-3.1-8b-instant",
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content:
            "You are a witty internet roast comic. Clever, playful, not mean."
        },
        {
          role: "user",
          content: `
User profile:
${JSON.stringify(profile, null, 2)}

Roast this person in 4 witty lines.
`
        }
      ]
    });

    return response.choices[0].message.content;
  } catch (err) {
    if (err.code === "insufficient_quota") {
      return `
🔥 Roast service unavailable (API credits not enabled).

But based on your profile:
- You definitely have opinions.
- You probably have unfinished side projects.
- You think this app is about you (it is).

(See README for AI integration details.)
`;
    }

    throw err;
  }
}
