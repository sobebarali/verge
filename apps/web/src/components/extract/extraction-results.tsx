import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ExtractionMetadata {
	title?: string;
	sourceURL: string;
}

interface ExtractionResult {
	success: boolean;
	data?: unknown;
	metadata?: ExtractionMetadata;
}

interface ExtractionResultsProps {
	result: ExtractionResult | null;
	isLoading: boolean;
	error: Error | null;
}

export function ExtractionResults({
	result,
	isLoading,
	error,
}: ExtractionResultsProps) {
	const [copied, setCopied] = useState(false);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-48" />
					<Skeleton className="mt-2 h-4 w-64" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-32 w-full" />
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="border-red-200 dark:border-red-900">
				<CardHeader>
					<CardTitle className="text-red-600 dark:text-red-400">
						Extraction Failed
					</CardTitle>
					<CardDescription>{error.message}</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (!result) {
		return null;
	}

	const isJson = typeof result.data === "object" && result.data !== null;
	const formattedData = isJson
		? JSON.stringify(result.data, null, 2)
		: String(result.data);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(formattedData);
			setCopied(true);
			toast.success("Copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy to clipboard");
		}
	};

	const handleDownload = () => {
		const blob = new Blob([formattedData], {
			type: isJson ? "application/json" : "text/plain",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `extraction-${Date.now()}.${isJson ? "json" : "txt"}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success("File downloaded");
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<CardTitle>
							{result.metadata?.title || "Extraction Result"}
						</CardTitle>
						{result.metadata?.sourceURL && (
							<CardDescription className="flex items-center gap-1">
								<ExternalLink className="h-3 w-3" />
								<a
									href={result.metadata.sourceURL}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:underline"
								>
									{result.metadata.sourceURL}
								</a>
							</CardDescription>
						)}
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleCopy}
							className="gap-1"
						>
							{copied ? (
								<Check className="h-4 w-4" />
							) : (
								<Copy className="h-4 w-4" />
							)}
							{copied ? "Copied" : "Copy"}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleDownload}
							className="gap-1"
						>
							<Download className="h-4 w-4" />
							Download
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="rounded-md bg-muted p-4">
					<pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
						{formattedData}
					</pre>
				</div>
			</CardContent>
		</Card>
	);
}
