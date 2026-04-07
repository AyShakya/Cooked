import openai from "./OpenAi.service.js";

const STYLE_PROMPTS = {
  friendly:
    "Playful and witty. Keep it light, clever, and not mean-spirited.",
  savage:
    "Sharper jokes with bold punchlines, but avoid hateful or abusive language.",
  analyst:
    "Roast like a sarcastic product analyst doing a teardown with nerdy humor.",
};

export async function generateRoast(profile, roastStyle = "friendly") {
  const selectedStyle = STYLE_PROMPTS[roastStyle] ? roastStyle : "friendly";

  try {
    const response = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content: `You are a witty internet roast comic. ${STYLE_PROMPTS[selectedStyle]}`,
        },
        {
          role: "user",
          content: `
User profile:
${JSON.stringify(profile, null, 2)}

Generate exactly 4 short roast lines in style: ${selectedStyle}.
`,
        },
      ],
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
