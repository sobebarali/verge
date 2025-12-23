import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import {
	ExtractionForm,
	type ExtractionFormInput,
} from "@/components/extract/extraction-form";
import { ExtractionResults } from "@/components/extract/extraction-results";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { trpcClient } from "@/utils/trpc";

interface ExtractionResult {
	success: boolean;
	data?: unknown;
	metadata?: {
		title?: string;
		sourceURL: string;
	};
}

export const Route = createFileRoute("/extract")({
	component: ExtractPage,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			redirect({
				to: "/login",
				throw: true,
			});
		}
		return { session };
	},
});

function ExtractPage() {
	const [result, setResult] = useState<ExtractionResult | null>(null);

	const extractMutation = useMutation({
		mutationFn: async (input: ExtractionFormInput) => {
			return trpcClient.scrape.extractData.mutate(input);
		},
		onSuccess: (data) => {
			toast.success("Data extracted successfully");
			setResult(data);
		},
		onError: (error) => {
			toast.error(error.message || "Extraction failed");
			setResult(null);
		},
	});

	const handleSubmit = (input: ExtractionFormInput) => {
		setResult(null);
		extractMutation.mutate(input);
	};

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<div className="mb-8">
				<h1 className="font-bold text-3xl">AI Data Extraction</h1>
				<p className="mt-2 text-muted-foreground">
					Extract structured data from any website using AI. Enter a URL and
					choose how you want to extract the data.
				</p>
			</div>

			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Extract Data</CardTitle>
						<CardDescription>
							Enter a URL and configure your extraction options
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ExtractionForm
							onSubmit={handleSubmit}
							isLoading={extractMutation.isPending}
						/>
					</CardContent>
				</Card>

				<ExtractionResults
					result={result}
					isLoading={extractMutation.isPending}
					error={extractMutation.error}
				/>
			</div>
		</div>
	);
}
