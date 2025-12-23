import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export type ExtractionType = "markdown" | "json";

export interface ExtractionFormInput {
	url: string;
	prompt?: string;
	outputSchema?: Record<string, unknown>;
}

interface ExtractionFormProps {
	onSubmit: (input: ExtractionFormInput) => void;
	isLoading: boolean;
}

export function ExtractionForm({ onSubmit, isLoading }: ExtractionFormProps) {
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			url: "",
			extractionType: "markdown" as ExtractionType,
			prompt: "",
			outputSchema: "",
		},
		onSubmit: async ({ value }) => {
			setFormError(null);

			// Validate URL
			try {
				new URL(value.url);
			} catch {
				setFormError("Please enter a valid URL");
				return;
			}

			const input: ExtractionFormInput = { url: value.url };

			if (value.extractionType === "json") {
				if (!value.prompt && !value.outputSchema) {
					setFormError(
						"For JSON extraction, provide either a prompt or schema",
					);
					return;
				}
				if (value.prompt) {
					input.prompt = value.prompt;
				}
				if (value.outputSchema) {
					try {
						input.outputSchema = JSON.parse(value.outputSchema);
					} catch {
						setFormError("Invalid JSON schema format");
						return;
					}
				}
			} else {
				// For markdown extraction, we need at least a prompt
				input.prompt = "Extract the main content as markdown";
			}

			onSubmit(input);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-6"
		>
			{/* URL Input */}
			<form.Field name="url">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Website URL</Label>
						<Input
							id={field.name}
							name={field.name}
							type="url"
							placeholder="https://example.com/page"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							disabled={isLoading}
						/>
					</div>
				)}
			</form.Field>

			{/* Extraction Type */}
			<form.Field name="extractionType">
				{(field) => (
					<div className="space-y-3">
						<Label>Extraction Type</Label>
						<RadioGroup
							value={field.state.value}
							onValueChange={(value) =>
								field.handleChange(value as ExtractionType)
							}
							className="flex gap-4"
							disabled={isLoading}
						>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="markdown" id="markdown" />
								<Label
									htmlFor="markdown"
									className="cursor-pointer font-normal"
								>
									Markdown (full page content)
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="json" id="json" />
								<Label htmlFor="json" className="cursor-pointer font-normal">
									Structured JSON (with AI extraction)
								</Label>
							</div>
						</RadioGroup>
					</div>
				)}
			</form.Field>

			{/* JSON Extraction Options */}
			<form.Subscribe selector={(state) => state.values.extractionType}>
				{(extractionType) =>
					extractionType === "json" && (
						<Tabs defaultValue="prompt" className="w-full">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="prompt">AI Prompt</TabsTrigger>
								<TabsTrigger value="schema">JSON Schema</TabsTrigger>
							</TabsList>

							<TabsContent value="prompt" className="space-y-2">
								<form.Field name="prompt">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>
												Describe what data you want to extract
											</Label>
											<Textarea
												id={field.name}
												name={field.name}
												placeholder="Extract the product name, price, description, and any available images..."
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												disabled={isLoading}
												rows={4}
											/>
											<p className="text-muted-foreground text-xs">
												Use natural language to describe the data you want to
												extract.
											</p>
										</div>
									)}
								</form.Field>
							</TabsContent>

							<TabsContent value="schema" className="space-y-2">
								<form.Field name="outputSchema">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>JSON Schema Definition</Label>
											<Textarea
												id={field.name}
												name={field.name}
												placeholder={`{
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "price": { "type": "number" },
    "description": { "type": "string" }
  }
}`}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												disabled={isLoading}
												rows={8}
												className="font-mono text-sm"
											/>
											<p className="text-muted-foreground text-xs">
												Define the exact structure of the data you want to
												extract.
											</p>
										</div>
									)}
								</form.Field>
							</TabsContent>
						</Tabs>
					)
				}
			</form.Subscribe>

			{/* Form-level errors */}
			{formError && (
				<div className="text-red-500 text-sm">
					<p>{formError}</p>
				</div>
			)}

			{/* Submit Button */}
			<form.Subscribe>
				{(state) => (
					<Button
						type="submit"
						className="w-full"
						disabled={!state.canSubmit || state.isSubmitting || isLoading}
					>
						{isLoading ? (
							<>
								<Loader />
								<span className="ml-2">Extracting...</span>
							</>
						) : (
							"Extract Data"
						)}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
