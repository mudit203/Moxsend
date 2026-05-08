"use client";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import CopyButton from "@/components/CopyButton";

const TONE_STYLES = {
  "Professional": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "Casual & Friendly": "bg-green-500/15 text-green-400 border-green-500/20",
  "Direct & Bold": "bg-orange-500/15 text-orange-400 border-orange-500/20",
};

export default function EmailCard({ variation, index, onImprove }) {
  const toneStyle = TONE_STYLES[variation.tone] || TONE_STYLES["Professional"];

  // Build the full copyable text
  const fullText = [
    `Subject: ${variation.subject_line}`,
    "",
    variation.personalized_line,
    "",
    variation.body,
  ].join("\n");

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm flex flex-col h-full">
      <CardHeader className="pb-3">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs bg-muted/50">
            Variation {index + 1}
          </Badge>
          <Badge variant="outline" className={`text-xs border ${toneStyle}`}>
            {variation.tone}
          </Badge>
        </div>

        {/* Subject Line */}
        <h3 className="text-base font-semibold text-foreground leading-snug mt-2">
          Subject: {variation.subject_line}
        </h3>

        {/* Personalized Line */}
        <p className="text-sm text-muted-foreground italic leading-relaxed">
          {variation.personalized_line}
        </p>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        {/* Email Body */}
        <div className="email-body-scroll max-h-56 overflow-y-auto pr-1">
          <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
            {variation.body}
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/30 gap-2">
        <CopyButton text={fullText} />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onImprove(variation)}
          className="text-primary hover:text-primary cursor-pointer"
        >
          Improve This Email
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
