"use server";

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getOpenAICompletion({ prompt }) {
  console.log(prompt)
  prompt += '\n절대로 500자를 넘지 않게 해줘'
  try {
    if (!prompt) {
      throw new Error("프롬프트가 필요합니다.");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 125,
      stream: false
    });
    console.log(response.choices[0].message.content)

    return response.choices[0].message.content;  // ✅ Extract and return content directly
  } catch (error) {
    console.error("OpenAI API 오류:", error);
    throw new Error("OpenAI 요청 중 오류 발생");
  }
}
