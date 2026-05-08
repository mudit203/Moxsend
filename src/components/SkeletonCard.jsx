"use client";

export default function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/80 p-6 space-y-4 animate-pulse">
      {/* Badge row */}
      <div className="flex items-center gap-2">
        <div className="h-5 w-20 rounded-full bg-muted/60" />
        <div className="h-5 w-24 rounded-full bg-muted/60" />
      </div>
      {/* Subject line */}
      <div className="h-5 bg-muted/60 rounded w-3/4" />
      {/* Personalized line */}
      <div className="h-4 bg-muted/40 rounded w-full" />
      {/* Body lines */}
      <div className="space-y-2.5 pt-2">
        <div className="h-3 bg-muted/30 rounded w-full" />
        <div className="h-3 bg-muted/30 rounded w-full" />
        <div className="h-3 bg-muted/30 rounded w-5/6" />
        <div className="h-3 bg-muted/30 rounded w-full" />
        <div className="h-3 bg-muted/30 rounded w-4/5" />
      </div>
      {/* Button row */}
      <div className="flex gap-2 pt-2">
        <div className="h-8 w-24 rounded-lg bg-muted/40" />
        <div className="h-8 w-36 rounded-lg bg-muted/40" />
      </div>
    </div>
  );
}
