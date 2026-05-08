"use client";
import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import {
  Upload,
  FileSpreadsheet,
  X,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
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
import CSVResultRow from "@/components/CSVResultRow";

const TONE_OPTIONS = [
  { value: "Professional", label: "Professional" },
  { value: "Casual & Friendly", label: "Casual & Friendly" },
  { value: "Direct & Bold", label: "Direct & Bold" },
];

export default function CSVUploader() {
  // Form state
  const [productInput, setProductInput] = useState("");
  const [selectedTone, setSelectedTone] = useState("Professional");

  // CSV state
  const [fileName, setFileName] = useState("");
  const [leads, setLeads] = useState([]);
  const [parseError, setParseError] = useState("");

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [results, setResults] = useState({});
  const [error, setError] = useState("");

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const abortRef = useRef(false);

  // ── Parse CSV ─────────────────────────────────
  const handleFile = useCallback((file) => {
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setParseError("Please upload a .csv file.");
      return;
    }

    setParseError("");
    setResults({});
    setProcessedCount(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data;

        if (rows.length === 0) {
          setParseError("The CSV file is empty.");
          return;
        }

        // Check for required 'name' column
        const headers = Object.keys(rows[0]).map((h) => h.toLowerCase().trim());
        if (!headers.includes("name")) {
          setParseError(
            'CSV must have a "name" column. Found columns: ' +
              Object.keys(rows[0]).join(", ")
          );
          return;
        }

        // Normalize keys to lowercase
        const normalizedLeads = rows.map((row) => {
          const normalized = {};
          Object.entries(row).forEach(([key, value]) => {
            normalized[key.toLowerCase().trim()] = value?.trim() || "";
          });
          return normalized;
        });

        // Filter out rows with empty names
        const validLeads = normalizedLeads.filter((l) => l.name);

        if (validLeads.length === 0) {
          setParseError("No valid leads found — all rows have an empty name.");
          return;
        }

        setLeads(validLeads);
        setFileName(file.name);
      },
      error: () => {
        setParseError("Failed to parse the CSV file. Please check its format.");
      },
    });
  }, []);

  // ── Drag & Drop handlers ──────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // ── Clear CSV ─────────────────────────────────
  const clearCSV = () => {
    setLeads([]);
    setFileName("");
    setResults({});
    setProcessedCount(0);
    setParseError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Process all leads sequentially ────────────
  const handleGenerate = async () => {
    if (!productInput.trim()) {
      setError("Please describe your product before generating.");
      return;
    }
    if (leads.length === 0) {
      setError("Please upload a CSV file first.");
      return;
    }

    setError("");
    setIsProcessing(true);
    setProcessedCount(0);
    setResults({});
    abortRef.current = false;

    for (let i = 0; i < leads.length; i++) {
      if (abortRef.current) break;

      const lead = leads[i];

      try {
        const res = await fetch("/api/generate-single", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productDescription: productInput,
            tone: selectedTone,
            lead: {
              name: lead.name,
              company: lead.company || "",
              role: lead.role || "",
            },
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setResults((prev) => ({
            ...prev,
            [i]: { error: data.error || "Failed to generate." },
          }));
        } else {
          setResults((prev) => ({ ...prev, [i]: data.email }));
        }
      } catch {
        setResults((prev) => ({
          ...prev,
          [i]: { error: "Network error. Please try again." },
        }));
      }

      setProcessedCount(i + 1);

      // Small delay between requests to be safe with rate limits
      if (i < leads.length - 1 && !abortRef.current) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    setIsProcessing(false);
  };

  const handleStop = () => {
    abortRef.current = true;
  };

  const progressPercent = leads.length > 0 ? (processedCount / leads.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* ── Product context card ──────────────────── */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">Bulk email generation</CardTitle>
          <CardDescription>
            Upload a CSV of leads and we&apos;ll generate a personalized email for
            each one.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Product Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Product / Service Description
            </label>
            <Textarea
              placeholder="Describe your product or service and its core value proposition..."
              rows={3}
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
              className="resize-none bg-input/50 border-border/50 placeholder:text-muted-foreground/50 focus:border-primary/50"
              disabled={isProcessing}
            />
          </div>

          {/* Tone selector */}
          <div className="space-y-2 w-full sm:w-56">
            <label className="text-sm font-medium text-foreground">
              Email Tone
            </label>
            <Select
              value={selectedTone}
              onValueChange={setSelectedTone}
              disabled={isProcessing}
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
        </CardContent>
      </Card>

      {/* ── Drop zone / File info ─────────────────── */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          {leads.length === 0 ? (
            /* Drop zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 py-12 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-primary/40 hover:bg-accent/20"
              }`}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/50">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Drop your CSV file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Required column: <code className="text-primary">name</code> · Optional:{" "}
                  <code>company</code>, <code>role</code>
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            /* File info + preview */
            <div className="space-y-4">
              {/* File header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {fileName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({leads.length} lead{leads.length !== 1 ? "s" : ""})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={clearCSV}
                  disabled={isProcessing}
                  className="cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Preview table */}
              <div className="rounded-lg border border-border/30 overflow-hidden">
                <div className="max-h-40 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                          #
                        </th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                          Name
                        </th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">
                          Company
                        </th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {leads.slice(0, 10).map((lead, i) => (
                        <tr key={i} className="hover:bg-accent/20">
                          <td className="px-3 py-2 text-xs text-muted-foreground font-mono">
                            {i + 1}
                          </td>
                          <td className="px-3 py-2 text-foreground">
                            {lead.name}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">
                            {lead.company || "—"}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">
                            {lead.role || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {leads.length > 10 && (
                  <div className="px-3 py-2 bg-muted/20 text-xs text-muted-foreground text-center border-t border-border/20">
                    +{leads.length - 10} more lead{leads.length - 10 !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {/* Generate / Stop buttons */}
              <div className="flex gap-3 items-center">
                {isProcessing ? (
                  <Button onClick={handleStop} variant="destructive" className="cursor-pointer">
                    <X className="w-4 h-4" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    onClick={handleGenerate}
                    disabled={!productInput.trim()}
                    className="cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate All ({leads.length})
                  </Button>
                )}

                {/* Progress */}
                {(isProcessing || processedCount > 0) && (
                  <span className="text-sm text-muted-foreground">
                    {processedCount}/{leads.length} processed
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {(isProcessing || processedCount > 0) && (
                <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Parse error */}
          {parseError && (
            <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{parseError}</p>
            </div>
          )}

          {/* General error */}
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1.5 mt-3">
              <span>⚠</span> {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Results ───────────────────────────────── */}
      {processedCount > 0 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">
              Generated emails
              {!isProcessing && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  — {Object.values(results).filter((r) => !r.error).length} of{" "}
                  {leads.length} successful
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {leads.map((lead, i) => (
              <CSVResultRow
                key={i}
                lead={lead}
                result={results[i] || null}
                index={i}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
