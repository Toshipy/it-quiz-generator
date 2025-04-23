"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

interface Question {
	question: string;
	choices: string[];
	answer: string;
}

export const GeneratorInput = () => {
	const [text, setText] = useState("");
	const [loading, setLoading] = useState(false);
	const [questions, setQuestions] = useState<Question[]>([]);

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
		} catch (error) {
			console.error("エラーが発生しました:", error);
		} finally {
			setLoading(false);
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
							<ul className="list-disc ml-6 mt-2 text-sm text-muted-foreground">
								{q.choices.map((choice, i) => (
									<li key={`${q.question}-${choice}-${i}`}>{choice}</li>
								))}
							</ul>
							<Accordion type="single" collapsible>
								<AccordionItem value="item-1">
									<AccordionTrigger className="font-bold text-green-600">
										正解
									</AccordionTrigger>
									<AccordionContent className="text-red-600">
										{q.answer}
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
