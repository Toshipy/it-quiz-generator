"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";

interface ChoiceQuestion {
	type: "choice";
	question: string;
	choices: string[];
	answer: string;
}

interface TextQuestion {
	type: "text";
	question: string;
	answer: string;
	keyPoints: string[];
	hint?: string;
}

type Question = ChoiceQuestion | TextQuestion;

interface Evaluation {
	score: number;
	feedback: string;
	keyPoints: string[];
	missingPoints: string[];
	suggestions: string;
}

export const GeneratorInput = () => {
	const [text, setText] = useState("");
	const [loading, setLoading] = useState(false);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [selectedAnswers, setSelectedAnswers] = useState<
		Record<number, string>
	>({});
	const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
	const [evaluations, setEvaluations] = useState<Record<number, Evaluation>>(
		{},
	);
	const [evaluating, setEvaluating] = useState<Record<number, boolean>>({});

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
			setTextAnswers({});
			setEvaluations({});
		} catch (error) {
			console.error("エラーが発生しました:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleChoiceAnswerChange = (questionIndex: number, value: string) => {
		setSelectedAnswers((prev) => ({
			...prev,
			[questionIndex]: value,
		}));
	};

	const handleTextAnswerChange = (questionIndex: number, value: string) => {
		setTextAnswers((prev) => ({
			...prev,
			[questionIndex]: value,
		}));
	};

	const handleSubmitAnswer = async (questionIndex: number) => {
		const question = questions[questionIndex];
		if (question.type !== "text") return;

		setEvaluating((prev) => ({
			...prev,
			[questionIndex]: true,
		}));

		try {
			const response = await fetch("/api/evaluate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					question: question.question,
					answer: question.answer,
					userAnswer: textAnswers[questionIndex] || "",
				}),
			});

			const evaluation = await response.json();
			setEvaluations((prev) => ({
				...prev,
				[questionIndex]: evaluation,
			}));
		} catch (error) {
			console.error("評価中にエラーが発生しました:", error);
		} finally {
			setEvaluating((prev) => ({
				...prev,
				[questionIndex]: false,
			}));
		}
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
				{loading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						生成中...
					</>
				) : (
					"クイズを生成する"
				)}
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
							{q.type === "choice" ? (
								<div className="mt-4">
									<RadioGroup
										value={selectedAnswers[idx] || ""}
										onValueChange={(value) =>
											handleChoiceAnswerChange(idx, value)
										}
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
							) : (
								<div className="mt-4 space-y-2">
									<Textarea
										placeholder="回答を入力してください（文章で説明してください）"
										className="min-h-[100px]"
										value={textAnswers[idx] || ""}
										onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
											handleTextAnswerChange(idx, e.target.value)
										}
									/>
									<div className="flex justify-between items-center">
										<Button
											onClick={() => handleSubmitAnswer(idx)}
											disabled={!textAnswers[idx] || evaluating[idx]}
										>
											{evaluating[idx] ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													評価中...
												</>
											) : (
												"提出する"
											)}
										</Button>
									</div>
									{evaluations[idx] && (
										<div className="mt-4 p-4 bg-gray-50 rounded-md space-y-3">
											<div className="flex items-center justify-between">
												<h3 className="font-medium">評価結果</h3>
												<span className="text-lg font-bold">
													スコア: {evaluations[idx].score}点
												</span>
											</div>
											<p className="text-sm">{evaluations[idx].feedback}</p>

											{evaluations[idx].keyPoints.length > 0 && (
												<div>
													<p className="text-sm font-medium text-green-600">
														含まれていた重要なポイント:
													</p>
													<ul className="list-disc ml-6 text-sm text-muted-foreground">
														{evaluations[idx].keyPoints.map((point, i) => (
															<li key={`key-point-${point}-${i}`}>{point}</li>
														))}
													</ul>
												</div>
											)}

											{evaluations[idx].missingPoints.length > 0 && (
												<div>
													<p className="text-sm font-medium text-amber-600">
														含めると良い重要なポイント:
													</p>
													<ul className="list-disc ml-6 text-sm text-muted-foreground">
														{evaluations[idx].missingPoints.map((point, i) => (
															<li key={`missing-point-${point}-${i}`}>
																{point}
															</li>
														))}
													</ul>
												</div>
											)}

											{evaluations[idx].suggestions && (
												<div>
													<p className="text-sm font-medium text-blue-600">
														改善のためのアドバイス:
													</p>
													<p className="text-sm text-muted-foreground">
														{evaluations[idx].suggestions}
													</p>
												</div>
											)}
										</div>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};
