export async function POST(req: Request) {
	const { text } = await req.json();

	console.log(text);

	// ここでクイズ問題を生成する処理を呼び出す（仮実装）
	const generatedQuestions = [
		{
			question: "インターネットとは何ですか？",
			choices: ["Webのこと", "ネットワークの集合体", "SNS", "サーバー"],
			answer: "ネットワークの集合体",
		},
	];

	return new Response(JSON.stringify(generatedQuestions));
}
