"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight, User, Building2, Briefcase } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import CopyButton from "@/components/CopyButton";

export default function CSVResultRow({ lead, result, index }) {
  const [open, setOpen] = useState(false);

  const hasError = result?.error;

  const fullText = result && !hasError
    ? [
        `Subject: ${result.subject_line}`,
        "",
        result.personalized_line,
        "",
        result.body,
      ].join("\n")
    : "";

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full cursor-pointer">
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
            open
              ? "bg-accent/50 border-border/50"
              : "bg-card/50 border-border/30 hover:bg-accent/30"
          }`}
        >
          {/* Expand icon */}
          <div className="text-muted-foreground">
            {open ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>

          {/* Index */}
          <span className="text-xs text-muted-foreground font-mono w-6">
            {index + 1}
          </span>

          {/* Lead info */}
          <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1.5 text-sm text-foreground font-medium">
              <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{lead.name || "—"}</span>
            </div>
            {lead.company && (
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{lead.company}</span>
              </div>
            )}
            {lead.role && (
              <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{lead.role}</span>
              </div>
            )}
          </div>

          {/* Status badge */}
          {hasError ? (
            <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
              Failed
            </Badge>
          ) : result ? (
            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
              Done
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground">
              Pending
            </Badge>
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="ml-10 mr-4 mt-2 mb-3 p-4 rounded-lg bg-muted/20 border border-border/30 space-y-3">
          {hasError ? (
            <p className="text-sm text-destructive">{result.error}</p>
          ) : result ? (
            <>
              {/* Subject */}
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Subject
                </span>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {result.subject_line}
                </p>
              </div>

              {/* Personalized Line */}
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Personalized Opening
                </span>
                <p className="text-sm text-foreground/80 italic mt-0.5">
                  {result.personalized_line}
                </p>
              </div>

              {/* Body */}
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email Body
                </span>
                <div className="email-body-scroll max-h-48 overflow-y-auto mt-0.5">
                  <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
                    {result.body}
                  </p>
                </div>
              </div>

              <CopyButton text={fullText} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Waiting to be processed...
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
