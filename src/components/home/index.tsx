"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Question {
	question: string;
	choices: string[];
	answer: string;
}

export const GeneratorInput = () => {
	const [text, setText] = useState("");
	const [loading, setLoading] = useState(false);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [selectedAnswers, setSelectedAnswers] = useState<
		Record<number, string>
	>({});

	const handleGenerate = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text }),
			});
			const data = await response.json();
			setQuestions(data);
			setSelectedAnswers({});
		} catch (error) {
			console.error("エラーが発生しました:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAnswerChange = (questionIndex: number, value: string) => {
		setSelectedAnswers((prev) => ({
			...prev,
			[questionIndex]: value,
		}));
	};

	return (
		<div className="max-w-2xl mx-auto py-10 space-y-6">
			<h1 className="text-2xl font-bold">クイズ生成アプリ</h1>
			<p className="text-sm text-muted-foreground">
				下の欄に文章を貼り付けて、「クイズを生成する」ボタンを押してください。
			</p>

			<Textarea
				placeholder="ここに文章を入力してください..."
				className="min-h-[200px]"
				value={text}
				onChange={(e) => setText(e.target.value)}
			/>

			<Button onClick={handleGenerate} disabled={loading}>
				{loading ? "生成中..." : "クイズを生成する"}
			</Button>

			{questions.length > 0 && (
				<div className="space-y-4 mt-6">
					{questions.map((q, idx) => (
						<div
							key={`${q.question}-${idx}`}
							className="p-4 border rounded-md shadow-sm"
						>
							<p className="font-semibold">
								{idx + 1}. {q.question}
							</p>
							<div className="mt-4">
								<RadioGroup
									value={selectedAnswers[idx] || ""}
									onValueChange={(value) => handleAnswerChange(idx, value)}
								>
									{q.choices.map((choice, i) => (
										<div
											key={`${q.question}-${choice}-${i}`}
											className="flex items-center space-x-2"
										>
											<RadioGroupItem value={choice} id={`${idx}-${i}`} />
											<label htmlFor={`${idx}-${i}`}>{choice}</label>
										</div>
									))}
								</RadioGroup>
								{selectedAnswers[idx] && (
									<p
										className={`mt-2 text-sm font-medium ${
											selectedAnswers[idx] === q.answer
												? "text-green-600"
												: "text-red-600"
										}`}
									>
										{selectedAnswers[idx] === q.answer
											? "正解です！"
											: `不正解です。正解は「${q.answer}」です。`}
									</p>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
