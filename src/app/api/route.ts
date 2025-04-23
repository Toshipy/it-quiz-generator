import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
	const { text } = await req.json();
	const prompt = `
	以下の文章をもとに、選択式クイズを10問作ってください。
必ず以下のJSON形式で返してください（日本語の説明は含めないでください）：

[
  {
    "question": "問題文",
    "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
    "answer": "正解の選択肢"
  },
  ...
]

文章:
${text}
`;
	const chatResponse = await openai.chat.completions.create({
		model: "gpt-4o",
		messages: [{ role: "user", content: prompt }],
	});

	const jsonText = chatResponse.choices[0].message.content || "";
	try {
		const cleanJsonText = jsonText.replace(/```json\n|\n```/g, "");
		const questions = JSON.parse(cleanJsonText);
		return NextResponse.json(questions);
	} catch (error) {
		console.error("JSONパースエラー:", error);
		return NextResponse.json(
			{ error: "JSONパースエラーが発生しました" },
			{ status: 500 },
		);
	}
}
