"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InputForm from "@/components/InputForm";
import EmailVariations from "@/components/EmailVariations";
import ImprovementPanel from "@/components/ImprovementPanel";
import CSVUploader from "@/components/CSVUploader";

export default function Home() {
  // --- Shared state for Generate Email tab ---
  const [variations, setVariations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [productDescription, setProductDescription] = useState("");

  return (
    <main className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-[0.2em] uppercase font-mono">
              MOX<span className="text-primary">SEND</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              AI-powered cold email generator
            </p>
          </div>
        </div>
      </header>

      {/* ── Content ────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="mb-8 bg-muted/50 border border-border/50">
            <TabsTrigger value="generate" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              ✦ Generate Email
            </TabsTrigger>
            <TabsTrigger value="csv" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              📄 CSV Bulk Upload
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Generate Email ───────────────── */}
          <TabsContent value="generate" className="space-y-10">
            <InputForm
              onGenerate={setVariations}
              onGenerating={setIsGenerating}
              isGenerating={isGenerating}
              onDescriptionChange={setProductDescription}
            />

            {/* Email Variations */}
            {(isGenerating || variations.length > 0) && (
              <EmailVariations
                variations={variations}
                isLoading={isGenerating}
                onImprove={(variation) => setSelectedEmail(variation)}
              />
            )}

            {/* Improvement Panel */}
            {selectedEmail && (
              <ImprovementPanel
                email={selectedEmail}
                productDescription={productDescription}
                onClose={() => setSelectedEmail(null)}
              />
            )}
          </TabsContent>

          {/* ── Tab 2: CSV Bulk Upload ──────────────── */}
          <TabsContent value="csv">
            <CSVUploader />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
