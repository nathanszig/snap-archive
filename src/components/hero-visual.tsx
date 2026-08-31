import type { ReactNode } from "react";
import { ScrollReveal } from "@/components/scroll-reveal";

const beforeItems = [
  "1 fichier JSON + page HTML buguée",
  "2 847 téléchargements un par un",
  "Dates = jour du download",
  "GPS absent des fichiers",
  "Texte/stickers en layers séparés",
];

const afterItems = [
  "1 ZIP trié par année / mois",
  "Tout en batch, filtre par période",
  "Dates EXIF restaurées",
  "Coordonnées GPS réinjectées",
  "Overlays fusionnés (photos)",
];

function ComparisonPanel({
  label,
  title,
  items,
  tone,
  preview,
}: {
  label: string;
  title: string;
  items: string[];
  tone: "before" | "after";
  preview: ReactNode;
}) {
  const isAfter = tone === "after";

  return (
    <div
      className={`flex h-full flex-col rounded-2xl border p-5 ${
        isAfter
          ? "border-accent/35 bg-accent/[0.06]"
          : "border-card-border bg-background"
      }`}
    >
      <p
        className={`text-xs font-medium uppercase tracking-wide ${
          isAfter ? "text-accent" : "text-muted"
        }`}
      >
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{title}</p>

      <ul className="mt-4 flex-1 space-y-2.5 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={`shrink-0 ${isAfter ? "text-success" : "text-danger"}`}>
              {isAfter ? "✓" : "✕"}
            </span>
            <span className={isAfter ? "text-foreground/90" : "text-muted"}>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 min-h-[92px]">{preview}</div>
    </div>
  );
}

export function HeroVisual() {
  return (
    <ScrollReveal direction="up" delay={80} className="w-full md:max-w-none">
      <div className="rounded-[2rem] border border-card-border bg-card p-6 shadow-2xl shadow-black/40">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Ce que tu obtiens</p>
            <p className="mt-1 font-medium">Export Snap brut → archive utilisable</p>
          </div>
          <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            100% local
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-4 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:items-stretch">
          <ComparisonPanel
            label="Avant"
            title="Export Snapchat officiel"
            items={beforeItems}
            tone="before"
            preview={
              <div className="flex h-full min-h-[92px] items-center rounded-xl border border-dashed border-card-border bg-card px-3 py-3 font-mono text-[11px] text-muted">
                memories_history.json
              </div>
            }
          />

          <div className="flex shrink-0 items-center justify-center py-2 xl:py-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-foreground">
              <span className="xl:hidden">↓</span>
              <span className="hidden xl:inline">→</span>
            </div>
          </div>

          <ComparisonPanel
            label="Après"
            title="Avec SnapArchive"
            items={afterItems}
            tone="after"
            preview={
              <div className="flex h-full min-h-[92px] flex-col justify-center space-y-1 rounded-xl border border-accent/25 bg-card px-3 py-3 font-mono text-[11px]">
                <p className="text-accent">snaparchive-2024-2025.zip</p>
                <p className="text-success">2024/01/15_18-32-04.jpg</p>
                <p className="text-success">2024/06/03_09-11-22.mp4</p>
                <p className="text-muted">2025/08/30_14-05-11.jpg</p>
              </div>
            }
          />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs sm:gap-3">
          <div className="rounded-2xl border border-card-border bg-background px-2 py-3 sm:px-3">
            <p className="font-mono text-base text-accent sm:text-lg">2 847</p>
            <p className="text-muted">memories</p>
          </div>
          <div className="rounded-2xl border border-card-border bg-background px-2 py-3 sm:px-3">
            <p className="font-mono text-base text-foreground sm:text-lg">7 ans</p>
            <p className="text-muted">d&apos;historique</p>
          </div>
          <div className="rounded-2xl border border-card-border bg-background px-2 py-3 sm:px-3">
            <p className="font-mono text-base text-success sm:text-lg">0</p>
            <p className="text-muted">upload serveur</p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
