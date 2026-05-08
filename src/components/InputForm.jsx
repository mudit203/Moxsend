"use client";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TONE_OPTIONS = [
  { value: "Professional", label: "Professional" },
  { value: "Casual & Friendly", label: "Casual & Friendly" },
  { value: "Direct & Bold", label: "Direct & Bold" },
];

export default function InputForm({
  onGenerate,
  onGenerating,
  isGenerating,
  onDescriptionChange,
}) {
  const [productInput, setProductInput] = useState("");
  const [audience, setAudience] = useState("");
  const [selectedTone, setSelectedTone] = useState("Professional");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate
    if (!productInput.trim()) {
      setError("Please describe your product or service before generating.");
      return;
    }

    // Start loading
    onGenerating(true);
    onDescriptionChange(productInput);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productDescription: productInput,
          tone: selectedTone,
          audience: audience,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      onGenerate(data.variations);
    } catch (err) {
      setError(err.message || "Failed to generate emails. Please try again.");
      onGenerate([]);
    } finally {
      onGenerating(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">Describe your outreach</CardTitle>
        <CardDescription>
          Tell us about your product and who you&apos;re reaching out to. We&apos;ll
          craft 3 personalized email variations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Description */}
          <div className="space-y-2">
            <label
              htmlFor="product-description"
              className="text-sm font-medium text-foreground"
            >
              Product / Service Description
            </label>
            <Textarea
              id="product-description"
              placeholder="Describe your product or service and its core value proposition..."
              rows={4}
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
              className="resize-none bg-input/50 border-border/50 placeholder:text-muted-foreground/50 focus:border-primary/50"
              disabled={isGenerating}
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <label
              htmlFor="audience"
              className="text-sm font-medium text-foreground"
            >
              Target Audience{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Textarea
              id="audience"
              placeholder="Who are you reaching out to? (e.g., VP of Sales at Series A startups)"
              rows={2}
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="resize-none bg-input/50 border-border/50 placeholder:text-muted-foreground/50 focus:border-primary/50"
              disabled={isGenerating}
            />
          </div>

          {/* Tone + Submit row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            {/* Tone Selector */}
            <div className="space-y-2 w-full sm:w-56">
              <label className="text-sm font-medium text-foreground">
                Email Tone
              </label>
              <Select
                value={selectedTone}
                onValueChange={setSelectedTone}
                disabled={isGenerating}
              >
                <SelectTrigger className="bg-input/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              type="submit"
              size="lg"
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Emails
                </>
              )}
            </Button>
          </div>

          {/* Inline error */}
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <span>⚠</span> {error}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
