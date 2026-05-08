"use client";
import EmailCard from "@/components/EmailCard";
import SkeletonCard from "@/components/SkeletonCard";

export default function EmailVariations({ variations, isLoading, onImprove }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-4">
        {isLoading ? "Generating your emails..." : "Your email variations"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : variations.map((variation, i) => (
              <EmailCard
                key={i}
                variation={variation}
                index={i}
                onImprove={onImprove}
              />
            ))}
      </div>
    </section>
  );
}
