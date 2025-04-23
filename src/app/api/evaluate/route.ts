import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
	try {
		const { question, answer, userAnswer } = await req.json();

		const prompt = `
以下の問題と正解、ユーザーの回答を評価してください。
評価は以下のJSON形式で返してください：

{
  "score": 0-100の数値,
  "feedback": "評価のフィードバック（日本語）",
  "keyPoints": ["含まれていた重要なポイント1", "含まれていた重要なポイント2", ...],
  "missingPoints": ["含まれていなかった重要なポイント1", "含まれていなかった重要なポイント2", ...],
  "suggestions": "改善のためのアドバイス（日本語）"
}

問題: ${question}
正解: ${answer}
ユーザーの回答: ${userAnswer}
`;

		const chatResponse = await openai.chat.completions.create({
			model: "gpt-4",
			messages: [{ role: "user", content: prompt }],
		});

		const jsonText = chatResponse.choices[0].message.content || "";
		try {
			// JSONの開始と終了を探す
			const jsonStart = jsonText.indexOf("{");
			const jsonEnd = jsonText.lastIndexOf("}") + 1;

			if (jsonStart === -1 || jsonEnd === 0) {
				throw new Error("JSONが見つかりません");
			}

			const cleanJsonText = jsonText.substring(jsonStart, jsonEnd);
			const evaluation = JSON.parse(cleanJsonText);

			return NextResponse.json(evaluation);
		} catch (error) {
			console.error("JSONパースエラー:", error);
			return NextResponse.json(
				{ error: "評価の生成中にエラーが発生しました" },
				{ status: 500 },
			);
		}
	} catch (error) {
		console.error("APIエラー:", error);
		return NextResponse.json(
			{ error: "リクエストの処理中にエラーが発生しました" },
			{ status: 500 },
		);
	}
}
