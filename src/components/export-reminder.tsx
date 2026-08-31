"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  copyExportPageUrl,
  dismissPendingExportReminder,
  downloadCalendarReminder,
  markExportRequested,
  scheduleBrowserReminder,
  shouldShowPendingBanner,
} from "@/lib/reminder";
import { getSiteUrl } from "@/lib/site-url";

export function PendingExportBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(shouldShowPendingBanner());
  }, []);

  if (!visible) return null;

  return (
    <div className="border-b border-card-border bg-card/95 px-6 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          <span className="font-medium text-foreground">Export Snap en cours ?</span>{" "}
          Reviens ici quand tu reçois le mail — on t&apos;attend sur{" "}
          <Link href="/export" className="underline">
            la page Exporter
          </Link>
          .
        </p>
        <div className="flex gap-2">
          <Link
            href="/export"
            className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground"
          >
            Importer mon export
          </Link>
          <button
            type="button"
            onClick={() => {
              dismissPendingExportReminder();
              setVisible(false);
            }}
            className="rounded-full border border-card-border px-4 py-1.5 text-sm text-muted"
          >
            C&apos;est bon
          </button>
        </div>
      </div>
    </div>
  );
}

export function ExportReminderPanel() {
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notificationScheduled, setNotificationScheduled] = useState(false);
  const siteUrl = getSiteUrl();

  async function handleConfirm() {
    markExportRequested();
    setConfirmed(true);
    downloadCalendarReminder(24, siteUrl);
  }

  async function handleCopyLink() {
    await copyExportPageUrl(siteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function handleBrowserReminder() {
    const scheduled = await scheduleBrowserReminder(24, siteUrl);
    setNotificationScheduled(scheduled);
  }

  return (
    <section className="rounded-3xl border border-card-border bg-card p-6 sm:p-8">
      <p className="text-sm font-medium uppercase tracking-[0.15em] text-accent">
        Ne perds pas le fil
      </p>
      <h2 className="mt-2 text-xl font-medium">
        Tu viens de demander ton export Snapchat ?
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Snap met entre quelques heures et 7 jours à envoyer le mail. Sans rappel, la plupart
        des gens oublient de revenir.
      </p>

      {!confirmed ? (
        <button
          type="button"
          onClick={() => void handleConfirm()}
          className="mt-5 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:brightness-95"
        >
          Oui — m&apos;aider à ne pas oublier
        </button>
      ) : (
        <div className="mt-5 space-y-3 rounded-2xl border border-card-border bg-background p-4 text-sm">
          <p className="text-success">✓ Rappel calendrier 24h téléchargé</p>
          <p className="text-muted">
            Ajoute aussi un favori ou copie le lien — tu reviendras en 1 clic quand le mail
            arrive.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleCopyLink()}
              className="rounded-full border border-card-border px-4 py-2"
            >
              {copied ? "Lien copié" : "Copier le lien /export"}
            </button>
            <button
              type="button"
              onClick={() => downloadCalendarReminder(72, siteUrl)}
              className="rounded-full border border-card-border px-4 py-2"
            >
              Rappel 72h (.ics)
            </button>
            <button
              type="button"
              onClick={() => void handleBrowserReminder()}
              className="rounded-full border border-card-border px-4 py-2"
              title="Ne fonctionne que si tu laisses l'onglet ouvert"
            >
              {notificationScheduled ? "Notif 24h activée" : "Notif navigateur 24h"}
            </button>
          </div>
          <p className="text-xs text-muted">
            Le rappel calendrier (.ics) est le plus fiable. La notif navigateur ne marche que si
            l&apos;onglet reste ouvert.
          </p>
        </div>
      )}
    </section>
  );
}
