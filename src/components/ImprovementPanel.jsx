"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CopyButton from "@/components/CopyButton";

function EmailPreview({ label, labelColor, email }) {
  const fullText = [
    `Subject: ${email.subject_line}`,
    "",
    email.personalized_line,
    "",
    email.body,
  ].join("\n");

  return (
    <div className="flex-1 min-w-0">
      {/* Label */}
      <Badge
        variant="outline"
        className={`mb-4 text-xs uppercase tracking-wider ${labelColor}`}
      >
        {label}
      </Badge>

      {/* Subject */}
      <h4 className="text-sm font-semibold text-foreground mb-1">
        {email.subject_line}
      </h4>

      {/* Personalized Line */}
      <p className="text-sm text-muted-foreground italic mb-3">
        {email.personalized_line}
      </p>

      {/* Body */}
      <div className="email-body-scroll max-h-60 overflow-y-auto pr-1">
        <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
          {email.body}
        </p>
      </div>

      {/* Copy */}
      <div className="mt-4">
        <CopyButton text={fullText} />
      </div>
    </div>
  );
}

export default function ImprovementPanel({
  email,
  productDescription,
  onClose,
}) {
  const [feedback, setFeedback] = useState("");
  const [improvedEmail, setImprovedEmail] = useState(null);
  const [isImproving, setIsImproving] = useState(false);
  const [error, setError] = useState("");
  const [changesSummary, setChangesSummary] = useState("");

  const handleImprove = async () => {
    if (!feedback.trim()) {
      setError("Please describe what you'd like to change.");
      return;
    }

    setError("");
    setIsImproving(true);

    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalEmail: email.body,
          originalSubjectLine: email.subject_line,
          originalPersonalizedLine: email.personalized_line,
          feedback: feedback,
          productDescription: productDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Improvement failed.");
      }

      setImprovedEmail(data.improved);
      setChangesSummary(data.changesSummary || "");
      
    } catch (err) {
      setError(err.message || "Failed to improve. Please try again.");
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Improve Email
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="cursor-pointer"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Separator className="bg-border/30" />

      {/* ── Before / After comparison ─────────────── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* BEFORE */}
        <EmailPreview
          label="Before"
          labelColor="bg-muted/50 text-muted-foreground border-border/50"
          email={email}
        />

        {/* Divider */}
       
            <div className="hidden lg:flex items-center">
              <div className="w-px h-full bg-border/30" />
              <ArrowRight className="w-5 h-5 text-primary mx-2 shrink-0" />
              <div className="w-px h-full bg-border/30" />
            </div>
            <div className="lg:hidden flex items-center gap-2 justify-center">
              <div className="h-px flex-1 bg-border/30" />
              <ArrowRight className="w-5 h-5 text-primary rotate-90" />
              <div className="h-px flex-1 bg-border/30" />
            </div>
         

        {/* AFTER */}
        {improvedEmail && (
          <EmailPreview
            label="After"
            labelColor="bg-primary/15 text-primary border-primary/20"
            email={improvedEmail}
          />
        )}
      </div>

      {/* Changes Summary */}
      {changesSummary && (
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
          <p className="text-xs font-medium text-primary mb-1">
            What changed:
          </p>
          <p className="text-sm text-foreground/70">{changesSummary}</p>
        </div>
      )}

      {/* ── Feedback input ────────────────────────── */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          {improvedEmail
            ? "Want to refine further?"
            : "What would you like to change?"}
        </label>
        <Textarea
          placeholder="e.g. Make it shorter, add a case study mention, use a more casual tone..."
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="resize-none bg-input/50 border-border/50 placeholder:text-muted-foreground/50 focus:border-primary/50"
          disabled={isImproving}
        />
        <div className="flex gap-3 items-center">
          <Button
            onClick={handleImprove}
            disabled={isImproving}
            className="cursor-pointer"
          >
            {isImproving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Improving...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {improvedEmail ? "Improve Again" : "Improve Email"}
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to results
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1.5">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    </div>
  );
}
