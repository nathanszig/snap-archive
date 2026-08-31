"use client";

import { useMemo, useState, type DragEvent } from "react";
import {
  buildExportZip,
  triggerBlobDownload,
} from "@/lib/snapchat/build-export-zip";
import {
  mapWithConcurrency,
  resolveMemoryFile,
} from "@/lib/snapchat/download-memory";
import {
  filterMemoriesByRange,
  getMemoryDateBounds,
  parseInputDate,
} from "@/lib/snapchat/filter-memories";
import { resolveMemoriesImport } from "@/lib/snapchat/parse-json";
import {
  formatBytes,
  getFullRangeSelection,
  getLastMonthsSelection,
  getOutsideFreeTierSelection,
} from "@/lib/snapchat/snap-free-tier";
import type {
  DownloadProgress,
  ExportOptions,
  ExportedFile,
  ImportMode,
  ParsedMemory,
} from "@/lib/snapchat/types";
import { DEFAULT_EXPORT_OPTIONS } from "@/lib/snapchat/types";
import { trackEvent } from "@/lib/analytics";
import { clearPendingExportReminder } from "@/lib/reminder";
import { ExportReminderPanel } from "@/components/export-reminder";
import { IconArchive, IconUpload } from "@/components/icons";
import { ScrollReveal } from "@/components/scroll-reveal";

function toInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type PeriodPreset = "outside-free" | "all" | "recent-12m" | "custom";

function applySelection(
  selection: { from: Date; to: Date },
  setFromDate: (value: string) => void,
  setToDate: (value: string) => void,
  setActivePreset: (value: PeriodPreset) => void,
  preset: PeriodPreset,
): void {
  setFromDate(toInputDate(selection.from));
  setToDate(toInputDate(selection.to));
  setActivePreset(preset);
}

function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

export function ExportTool() {
  const [memories, setMemories] = useState<ParsedMemory[]>([]);
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<ImportMode | null>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [activePreset, setActivePreset] = useState<PeriodPreset>("custom");
  const [freeTierNotice, setFreeTierNotice] = useState<string | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
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

  const outsideFreeSelection = useMemo(
    () => getOutsideFreeTierSelection(memories),
    [memories],
  );

  const fullSelection = useMemo(() => {
    if (memories.length === 0) return null;
    return getFullRangeSelection(memories);
  }, [memories]);

  const recentSelection = useMemo(
    () => getLastMonthsSelection(memories, 12),
    [memories],
  );

  const filteredMemories = useMemo(() => {
    if (memories.length === 0) return [];

    return filterMemoriesByRange(memories, {
      from: fromDate ? parseInputDate(fromDate) : null,
      to: toDate ? parseInputDate(toDate) : null,
    });
  }, [fromDate, memories, toDate]);

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => file.size > 0);
    if (files.length === 0) return;

    setError(null);
    setImportStatus(null);
    setIsImporting(true);
    setProgress((state) => ({ ...state, status: "idle", errors: [] }));

    try {
      const result = await resolveMemoriesImport(files, setImportStatus);
      const dateBounds = getMemoryDateBounds(result.memories);

      setMemories(result.memories);
      setFileLabel(result.sourceLabel);
      setImportMode(result.mode);

      const outsideFree = getOutsideFreeTierSelection(result.memories);
      if (outsideFree) {
        applySelection(outsideFree, setFromDate, setToDate, setActivePreset, "outside-free");
        trackEvent("preset_outside_free", {
          source: "auto",
          count: String(outsideFree.count),
        });
        setFreeTierNotice(
          `${outsideFree.count.toLocaleString("fr-FR")} memories (~${formatBytes(outsideFree.totalBytes)}) hors des 5 Go gratuits Snap — période présélectionnée.${outsideFree.usesEstimatedSizes ? " Estimation basée sur la taille réelle des fichiers quand disponible." : ""}`,
        );
      } else {
        applySelection(
          getFullRangeSelection(result.memories),
          setFromDate,
          setToDate,
          setActivePreset,
          "all",
        );
        setFreeTierNotice(
          "Toutes tes memories tiennent dans les 5 Go gratuits Snap. Période complète sélectionnée.",
        );
      }

      setImportStatus(null);

      const notices: string[] = [];
      if (result.mode === "bundled") {
        notices.push(
          "Export Snapchat récent détecté : les photos sont lues directement depuis tes ZIP (sans lien de téléchargement).",
        );
      }
      if (result.unmatchedLocal > 0) {
        notices.push(
          `${result.unmatchedLocal.toLocaleString("fr-FR")} memories n'ont pas pu être associées à un fichier.`,
        );
      }
      if (result.skippedNoLink > 0) {
        notices.push(
          `${result.skippedNoLink.toLocaleString("fr-FR")} entrées ignorées (métadonnées incomplètes).`,
        );
      }
      setImportNotice(notices.length > 0 ? notices.join(" ") : null);

      trackEvent("zip_imported", {
        mode: result.mode,
        count: String(result.memories.length),
        unmatched: String(result.unmatchedLocal),
      });

      clearPendingExportReminder();
    } catch (caught) {
      setMemories([]);
      setFileLabel(null);
      setImportMode(null);
      setImportNotice(null);
      setFreeTierNotice(null);
      setActivePreset("custom");
      setImportStatus(null);
      setError(caught instanceof Error ? caught.message : "Import impossible.");
    } finally {
      setIsImporting(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (isImporting) return;
    void handleFiles(event.dataTransfer.files);
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

    trackEvent("export_started", {
      count: String(filteredMemories.length),
      preset: activePreset,
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
        const file = await resolveMemoryFile(memory, exportOptions);
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

    trackEvent("export_done", {
      count: String(exportedFiles.length),
      failed: String(failed),
    });
  }

  const progressRatio =
    progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="mx-auto min-w-0 max-w-4xl space-y-8 overflow-x-hidden px-6 py-12">
      <ScrollReveal className="space-y-3">
        <p className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card px-3 py-1 text-xs uppercase tracking-[0.15em] text-muted">
          <IconArchive className="h-4 w-4 text-accent" />
          Export local
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Exporter mes Memories</h1>
        <p className="text-muted">
          Glisse <strong className="font-medium text-foreground">tous tes ZIP mydata</strong>{" "}
          téléchargés depuis Snapchat — on trouve le fichier nécessaire automatiquement.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={80}>
      <section className="min-w-0 overflow-hidden rounded-3xl border border-card-border bg-card p-4 sm:p-6">
        <label
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-card-border bg-background px-6 py-12 text-center transition hover:border-foreground/20"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".json,.zip,application/json,application/zip"
            multiple
            className="hidden"
            disabled={isImporting}
            onChange={(event) => {
              if (event.target.files) void handleFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-card-border bg-card text-accent">
            <IconUpload className="h-7 w-7" />
          </div>
          <p className="text-lg font-medium">
            {isImporting ? "Analyse en cours…" : "Glisse tous tes ZIP Snapchat ici"}
          </p>
          <p className="mt-2 max-w-md text-sm text-muted">
            Sélectionne ou dépose tous les fichiers{" "}
            <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs text-foreground">
              mydata~….zip
            </code>{" "}
            d&apos;un coup — pas besoin de les décompresser.
          </p>
          {importStatus ? (
            <p className="mt-4 text-sm text-muted">{importStatus}</p>
          ) : null}
          {fileLabel ? (
            <p className="mt-4 rounded-full border border-card-border bg-card px-3 py-1 text-sm text-foreground">
              {fileLabel}
            </p>
          ) : null}
        </label>

        {memories.length > 0 ? (
          <>
            <div className="mt-6 min-w-0 grid gap-4 sm:grid-cols-3">
              <Stat label="Memories détectées" value={memories.length.toLocaleString("fr-FR")} />
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

            <div className="mt-6 min-w-0 overflow-hidden rounded-2xl border border-card-border bg-background p-4 sm:p-5">
              <h2 className="text-base font-medium">Filtrer par période</h2>
              <p className="mt-1 text-sm text-muted">
                Raccourci ou dates manuelles — cible surtout les memories hors quota Snap gratuit.
              </p>

              <div
                className={`mt-4 grid gap-2 ${outsideFreeSelection ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
              >
                {outsideFreeSelection ? (
                  <PeriodPresetOption
                    active={activePreset === "outside-free"}
                    label="Hors 5 Go Snap"
                    detail={`${outsideFreeSelection.count.toLocaleString("fr-FR")} memories · ~${formatBytes(outsideFreeSelection.totalBytes)}`}
                    recommended
                    onClick={() => {
                      applySelection(
                        outsideFreeSelection,
                        setFromDate,
                        setToDate,
                        setActivePreset,
                        "outside-free",
                      );
                      trackEvent("preset_outside_free", {
                        source: "manual",
                        count: String(outsideFreeSelection.count),
                      });
                    }}
                  />
                ) : null}
                {fullSelection ? (
                  <PeriodPresetOption
                    active={activePreset === "all"}
                    label="Toute la période"
                    detail={`${fullSelection.count.toLocaleString("fr-FR")} memories`}
                    onClick={() =>
                      applySelection(
                        fullSelection,
                        setFromDate,
                        setToDate,
                        setActivePreset,
                        "all",
                      )
                    }
                  />
                ) : null}
                {recentSelection ? (
                  <PeriodPresetOption
                    active={activePreset === "recent-12m"}
                    label="12 derniers mois"
                    detail={`${recentSelection.count.toLocaleString("fr-FR")} memories`}
                    onClick={() =>
                      applySelection(
                        recentSelection,
                        setFromDate,
                        setToDate,
                        setActivePreset,
                        "recent-12m",
                      )
                    }
                  />
                ) : null}
              </div>

              <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4">
                <label className="min-w-0 space-y-2 text-sm">
                  <span className="text-muted">Du</span>
                  <input
                    type="date"
                    value={fromDate}
                    min={bounds ? toInputDate(bounds.min) : undefined}
                    max={toDate || (bounds ? toInputDate(bounds.max) : undefined)}
                    onChange={(event) => {
                      setFromDate(event.target.value);
                      setActivePreset("custom");
                    }}
                    className="date-input box-border w-full min-w-0 max-w-full rounded-xl border border-card-border bg-card px-3 py-2.5 text-foreground [color-scheme:dark]"
                  />
                </label>
                <label className="min-w-0 space-y-2 text-sm">
                  <span className="text-muted">Au</span>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || (bounds ? toInputDate(bounds.min) : undefined)}
                    max={bounds ? toInputDate(bounds.max) : undefined}
                    onChange={(event) => {
                      setToDate(event.target.value);
                      setActivePreset("custom");
                    }}
                    className="date-input box-border w-full min-w-0 max-w-full rounded-xl border border-card-border bg-card px-3 py-2.5 text-foreground [color-scheme:dark]"
                  />
                </label>
              </div>

              {freeTierNotice ? (
                <p className="mt-4 text-sm text-muted">{freeTierNotice}</p>
              ) : null}
            </div>
          </>
        ) : null}

        {importNotice ? (
          <p className="mt-4 rounded-2xl border border-card-border bg-background px-4 py-3 text-sm text-muted">
            {importNotice}
          </p>
        ) : null}

        {importMode === "bundled" ? (
          <p className="mt-3 text-xs text-muted">
            Mode export media inclus : inutile d&apos;extraire les ZIP — SnapArchive lit les fichiers
            dans <code className="font-mono text-foreground">memories/</code> directement.
          </p>
        ) : null}
      </section>
      </ScrollReveal>

      {memories.length === 0 ? (
        <ScrollReveal delay={120}>
          <ExportReminderPanel />
        </ScrollReveal>
      ) : null}

      {memories.length > 0 ? (
        <ScrollReveal delay={100}>
        <section className="rounded-3xl border border-card-border bg-card p-6">
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium">Options d&apos;export</h3>
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
          <li>Reviens ici et glisse <strong className="text-foreground">tous les ZIP</strong> mydata d&apos;un coup</li>
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

function PeriodPresetOption({
  label,
  detail,
  active,
  recommended = false,
  onClick,
}: {
  label: string;
  detail: string;
  active: boolean;
  recommended?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left transition ${
        active
          ? recommended
            ? "border-accent/70 bg-accent/10 text-foreground ring-1 ring-accent/40"
            : "border-foreground/25 bg-card text-foreground ring-1 ring-foreground/10"
          : "border-card-border bg-card text-muted hover:border-foreground/15 hover:text-foreground"
      }`}
    >
      <span className="block text-sm font-medium">{label}</span>
      <span className="mt-1 block text-xs leading-5 opacity-80">{detail}</span>
    </button>
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
    <div className="min-w-0 rounded-2xl border border-card-border bg-background p-4">
      <p className="text-sm text-muted">{label}</p>
      <p
        className={`mt-2 break-words text-base font-medium leading-snug sm:text-lg ${highlight ? "text-accent" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
