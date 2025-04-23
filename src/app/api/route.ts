import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
	const { text } = await req.json();
	const prompt = `
	以下の文章をもとに、選択式クイズを5問と自由入力式クイズを3問作ってください。
	入力テキストが英語の場合でも、必ず日本語で問題を作成してください。
	必ず以下のJSON形式で返してください（日本語の説明は含めないでください）。
	レスポンスは必ず[で始まり、]で終わるJSON配列にしてください。
	説明や前置きは一切含めないでください。

[
  {
    "type": "choice",
    "question": "問題文",
    "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
    "answer": "正解の選択肢"
  },
  {
    "type": "text",
    "question": "〜について説明してください",
    "answer": "正解の回答（詳細な説明）",
    "keyPoints": ["重要なポイント1", "重要なポイント2", "重要なポイント3"],
    "hint": "ヒント（オプション）"
  },
  ...
]

自由入力式のクイズは、単語や短いフレーズではなく、説明や解説を求める形式にしてください。
例えば「〜の役割について説明してください」「〜の仕組みについて解説してください」など。

文章:
${text}
`;
	const chatResponse = await openai.chat.completions.create({
		model: "gpt-4",
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
