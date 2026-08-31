"use client";

import { useMemo, useState } from "react";
import {
  buildExportZip,
  triggerBlobDownload,
} from "@/lib/snapchat/build-export-zip";
import {
  downloadMemoryFile,
  mapWithConcurrency,
} from "@/lib/snapchat/download-memory";
import {
  filterMemoriesByRange,
  getMemoryDateBounds,
} from "@/lib/snapchat/filter-memories";
import {
  extractJsonFromZip,
  parseMemoriesJson,
} from "@/lib/snapchat/parse-json";
import type {
  DownloadProgress,
  ExportOptions,
  ExportedFile,
  ParsedMemory,
} from "@/lib/snapchat/types";
import { DEFAULT_EXPORT_OPTIONS } from "@/lib/snapchat/types";
import { clearPendingExportReminder } from "@/lib/reminder";
import { ExportReminderPanel } from "@/components/export-reminder";
import { IconArchive, IconUpload } from "@/components/icons";
import { ScrollReveal } from "@/components/scroll-reveal";

function toInputDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

export function ExportTool() {
  const [memories, setMemories] = useState<ParsedMemory[]>([]);
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [exportOptions, setExportOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<DownloadProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    currentLabel: "",
    status: "idle",
    errors: [],
  });

  const bounds = useMemo(() => {
    if (memories.length === 0) return null;
    return getMemoryDateBounds(memories);
  }, [memories]);

  const filteredMemories = useMemo(() => {
    if (memories.length === 0) return [];

    return filterMemoriesByRange(memories, {
      from: fromDate ? new Date(fromDate) : null,
      to: toDate ? new Date(toDate) : null,
    });
  }, [fromDate, memories, toDate]);

  async function handleFile(file: File) {
    setError(null);
    setProgress((state) => ({ ...state, status: "idle", errors: [] }));

    try {
      const jsonText = file.name.toLowerCase().endsWith(".zip")
        ? await extractJsonFromZip(file)
        : await file.text();

      const parsed = parseMemoriesJson(jsonText);
      const dateBounds = getMemoryDateBounds(parsed);

      setMemories(parsed);
      setFileLabel(file.name);
      setFromDate(toInputDate(dateBounds.min));
      setToDate(toInputDate(dateBounds.max));
      clearPendingExportReminder();
    } catch (caught) {
      setMemories([]);
      setFileLabel(null);
      setError(caught instanceof Error ? caught.message : "Import impossible.");
    }
  }

  async function handleExport() {
    if (filteredMemories.length === 0) {
      setError("Aucune memory dans la période sélectionnée.");
      return;
    }

    setError(null);
    setProgress({
      total: filteredMemories.length,
      completed: 0,
      failed: 0,
      currentLabel: "Démarrage…",
      status: "running",
      errors: [],
    });

    const exportedFiles: ExportedFile[] = [];
    const errors: string[] = [];
    let completed = 0;
    let failed = 0;

    await mapWithConcurrency(filteredMemories, 4, async (memory) => {
      setProgress((state) => ({
        ...state,
        currentLabel: `${memory.date.toISOString().slice(0, 10)} · ${memory.id}`,
      }));

      try {
        const file = await downloadMemoryFile(memory, exportOptions);
        exportedFiles.push(file);
        completed += 1;
      } catch (caught) {
        failed += 1;
        const message =
          caught instanceof Error
            ? `${memory.id}: ${caught.message}`
            : `${memory.id}: échec`;
        errors.push(message);
      }

      setProgress((state) => ({
        ...state,
        completed,
        failed,
        errors,
      }));

      return null;
    });

    if (exportedFiles.length === 0) {
      setProgress((state) => ({ ...state, status: "error" }));
      setError(
        "Aucun fichier téléchargé. Les liens Snapchat expirent en ~7 jours — refais un export officiel récent.",
      );
      return;
    }

    const zip = await buildExportZip(exportedFiles);
    const suffix =
      fromDate && toDate ? `${fromDate}_${toDate}` : new Date().toISOString().slice(0, 10);
    triggerBlobDownload(zip, `snaparchive-${suffix}.zip`);

    setProgress((state) => ({
      ...state,
      status: failed > 0 ? "error" : "done",
      currentLabel: "Export terminé",
      errors,
    }));
  }

  const progressRatio =
    progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
      <ScrollReveal className="space-y-3">
        <p className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card px-3 py-1 text-xs uppercase tracking-[0.15em] text-muted">
          <IconArchive className="h-4 w-4 text-accent" />
          Export local
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Exporter mes Memories</h1>
        <p className="text-muted">
          Importe{" "}
          <code className="rounded bg-card px-1.5 py-0.5 font-mono text-sm text-foreground">
            memories_history.json
          </code>{" "}
          ou le ZIP mydata Snapchat. Choisis une période, puis lance le téléchargement.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={80}>
      <section className="rounded-3xl border border-card-border bg-card p-6">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-card-border bg-background px-6 py-12 text-center transition hover:border-foreground/20">
          <input
            type="file"
            accept=".json,.zip,application/json,application/zip"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-card-border bg-card text-accent">
            <IconUpload className="h-7 w-7" />
          </div>
          <p className="text-lg font-medium">Glisse ton export ici</p>
          <p className="mt-2 max-w-md text-sm text-muted">
            memories_history.json ou mydata.zip · max recommandé ~2 000 fichiers par session
            navigateur
          </p>
          {fileLabel ? (
            <p className="mt-4 rounded-full border border-card-border bg-card px-3 py-1 text-sm text-foreground">
              {fileLabel}
            </p>
          ) : null}
        </label>

        {memories.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat label="Memories totales" value={memories.length.toLocaleString("fr-FR")} />
            <Stat
              label="Période disponible"
              value={
                bounds
                  ? `${formatDisplayDate(bounds.min)} → ${formatDisplayDate(bounds.max)}`
                  : "—"
              }
            />
            <Stat
              label="Sélection actuelle"
              value={filteredMemories.length.toLocaleString("fr-FR")}
              highlight
            />
          </div>
        ) : null}
      </section>
      </ScrollReveal>

      <ScrollReveal delay={120}>
      <ExportReminderPanel />
      </ScrollReveal>

      {memories.length > 0 ? (
        <ScrollReveal delay={100}>
        <section className="rounded-3xl border border-card-border bg-card p-6">
          <h2 className="text-xl font-medium">Filtrer par période</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-muted">Du</span>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-full rounded-xl border border-card-border bg-background px-3 py-2"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted">Au</span>
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="w-full rounded-xl border border-card-border bg-background px-3 py-2"
              />
            </label>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium">Options v2</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Toggle
                label="Dates EXIF"
                description="Date de capture dans les propriétés du fichier"
                checked={exportOptions.embedExifDates}
                onChange={(checked) =>
                  setExportOptions((state) => ({ ...state, embedExifDates: checked }))
                }
              />
              <Toggle
                label="GPS"
                description="Coordonnées depuis memories_history.json"
                checked={exportOptions.includeGps}
                onChange={(checked) =>
                  setExportOptions((state) => ({ ...state, includeGps: checked }))
                }
              />
              <Toggle
                label="Overlays photos"
                description="Fusion texte/stickers sur les JPG"
                checked={exportOptions.mergeOverlays}
                onChange={(checked) =>
                  setExportOptions((state) => ({ ...state, mergeOverlays: checked }))
                }
              />
            </div>
            <p className="text-xs text-muted">
              Overlays vidéo et fusion de fragments : prévu en v3 desktop.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={progress.status === "running" || filteredMemories.length === 0}
            className="mt-6 rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground transition enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {progress.status === "running"
              ? `Export en cours (${progressRatio}%)`
              : `Télécharger ${filteredMemories.length.toLocaleString("fr-FR")} memories`}
          </button>
        </section>
        </ScrollReveal>
      ) : null}

      {progress.status !== "idle" ? (
        <ScrollReveal>
        <section className="rounded-3xl border border-card-border bg-card p-6">
          <div className="flex items-center justify-between text-sm">
            <span>
              {progress.completed}/{progress.total} terminés
            </span>
            {progress.failed > 0 ? (
              <span className="text-danger">{progress.failed} échecs</span>
            ) : null}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${progressRatio}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-muted">{progress.currentLabel}</p>
          {progress.errors.length > 0 ? (
            <ul className="mt-4 space-y-1 text-sm text-danger">
              {progress.errors.slice(0, 5).map((item) => (
                <li key={item}>{item}</li>
              ))}
              {progress.errors.length > 5 ? (
                <li>… et {progress.errors.length - 5} autres erreurs</li>
              ) : null}
            </ul>
          ) : null}
        </section>
        </ScrollReveal>
      ) : null}

      {error ? (
        <ScrollReveal>
        <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
        </ScrollReveal>
      ) : null}

      <ScrollReveal delay={140}>
      <section className="rounded-3xl border border-card-border bg-card/60 p-6 text-sm leading-6 text-muted">
        <p className="font-medium text-foreground">Avant de lancer — export Snapchat</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            Va sur{" "}
            <a
              className="text-foreground underline"
              href="https://accounts.snapchat.com/accounts/welcome"
              target="_blank"
              rel="noreferrer"
            >
              accounts.snapchat.com
            </a>{" "}
            → <strong className="text-foreground">Mes données</strong>
          </li>
          <li>
            Coche <strong className="text-foreground">Export your Memories</strong> et{" "}
            <strong className="text-foreground">Export JSON files</strong> (obligatoire pour
            dates + GPS)
          </li>
          <li>
            Clique <strong className="text-foreground">Request Only Memories</strong> → toute la
            période → Submit
          </li>
          <li>Attends le mail et télécharge tous les ZIP (liens valides ~7 jours)</li>
          <li>Reviens ici et importe le JSON ou le ZIP mydata</li>
        </ol>
        <p className="mt-4 font-medium text-foreground">Pendant l&apos;export SnapArchive</p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>Garde l&apos;onglet ouvert — ne ferme pas le navigateur</li>
          <li>Rien n&apos;est uploadé chez nous : tout reste sur ta machine</li>
        </ul>
      </section>
      </ScrollReveal>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-2xl border border-card-border bg-background p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-accent"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-1 block text-xs text-muted">{description}</span>
      </span>
    </label>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-card-border bg-background p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 text-lg font-medium ${highlight ? "text-accent" : ""}`}>{value}</p>
    </div>
  );
}
