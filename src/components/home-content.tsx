"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ExportReminderPanel } from "@/components/export-reminder";
import { HeroVisual } from "@/components/hero-visual";
import {
  IconArchive,
  IconCalendar,
  IconCloudDownload,
  IconGhost,
  IconLayers,
  IconLock,
  IconMapPin,
  IconShield,
  IconSliders,
  IconSpark,
  IconSticker,
  IconUpload,
} from "@/components/icons";
import { ScrollReveal } from "@/components/scroll-reveal";

const SNAP_ACCOUNT_URL = "https://accounts.snapchat.com/accounts/welcome";

function linkifyDetail(text: string): ReactNode {
  const parts = text.split(/(accounts\.snapchat\.com|page Exporter)/g);

  return parts.map((part, index) => {
    if (part === "accounts.snapchat.com") {
      return (
        <a
          key={`${part}-${index}`}
          href={SNAP_ACCOUNT_URL}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-accent/60 underline-offset-2 hover:text-accent"
        >
          {part}
        </a>
      );
    }

    if (part === "page Exporter") {
      return (
        <Link
          key={`${part}-${index}`}
          href="/export"
          className="underline decoration-accent/60 underline-offset-2 hover:text-accent"
        >
          {part}
        </Link>
      );
    }

    return part;
  });
}

const features = [
  {
    icon: IconShield,
    title: "100% local",
    body: "Tes photos ne quittent jamais ton navigateur.",
  },
  {
    icon: IconCalendar,
    title: "Dates EXIF",
    body: "La vraie date de capture, pas la date du téléchargement.",
  },
  {
    icon: IconMapPin,
    title: "GPS restauré",
    body: "Coordonnées réinjectées depuis l'export Snap.",
  },
  {
    icon: IconLayers,
    title: "Overlays photos",
    body: "Texte et stickers fusionnés sur les JPG.",
  },
];

const steps = [
  {
    icon: IconCloudDownload,
    title: "Demande l'export Snapchat",
    body: "C'est la seule étape obligatoire côté Snap — on ne peut pas la faire à ta place.",
    details: [
      "Va sur accounts.snapchat.com et connecte-toi",
      "Clique « Mes données » (1re option du menu)",
      "Active « Export your Memories » et « Export JSON files »",
      "Clique « Request Only Memories », choisis toute la période, puis Submit",
      "Attends le mail (quelques heures à 7 jours selon le volume)",
      "Clique « Oui — m'aider à ne pas oublier » sur SnapArchive pour un rappel calendrier",
    ],
  },
  {
    icon: IconArchive,
    title: "Télécharge tous les ZIP",
    body: "Snapchat envoie souvent plusieurs fichiers mydata.zip — il faut tous les récupérer.",
    details: [
      "Ouvre le lien reçu par mail ou reviens dans Mes données → Your exports",
      "Télécharge chaque archive ZIP listée",
      "Ne t'arrête pas au memories_history.html dans le navigateur — il bugge en masse",
      "Garde les fichiers : les liens expirent en ~7 jours",
    ],
  },
  {
    icon: IconUpload,
    title: "Importe sur SnapArchive",
    body: "Tout se passe dans ton navigateur. Rien n'est envoyé sur nos serveurs.",
    details: [
      "Va sur la page Exporter",
      "Glisse tous les ZIP mydata d'un coup (Ctrl+A dans ton dossier Téléchargements)",
      "Pas besoin d'ouvrir ou décompresser — on trouve memories_history.json tout seul",
    ],
  },
  {
    icon: IconSliders,
    title: "Filtre, options, ZIP final",
    body: "Tu choisis quoi sauver — utile si tu dépasses les 5 Go gratuits Snap.",
    details: [
      "Filtre par période (ex. seulement 2024–2025)",
      "Active dates EXIF, GPS et overlays photos si besoin",
      "Lance l'export → tu reçois un ZIP trié YYYY/MM/",
    ],
  },
];

const faqs = [
  {
    icon: IconLock,
    q: "Est-ce que vous stockez mes photos ?",
    a: "Non. Le traitement se fait entièrement dans ton navigateur. Rien ne transite par nos serveurs.",
  },
  {
    icon: IconMapPin,
    q: "Les dates et le GPS sont restaurés ?",
    a: "Oui pour les photos JPEG : dates EXIF + coordonnées GPS lues depuis memories_history.json.",
  },
  {
    icon: IconSticker,
    q: "Et les textes / stickers sur les snaps ?",
    a: "Oui pour les photos — fusion automatique des overlays. Vidéos : média principal seulement (v3).",
  },
];

export function HomeContent() {
  return (
    <div className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 grid-overlay" aria-hidden="true" />

      <section className="relative mx-auto grid w-full max-w-6xl justify-items-center gap-10 px-6 pb-14 pt-12 md:grid-cols-2 md:items-center md:justify-items-stretch md:gap-8 md:pb-16 md:pt-16 lg:gap-12 lg:py-24">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(520px,70vh)] bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(255,252,0,0.09),transparent_68%)]"
          aria-hidden="true"
        />
        <ScrollReveal className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-6 text-center md:mx-0 md:max-w-none md:items-start md:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted backdrop-blur">
            <IconGhost className="h-4 w-4 text-accent" />
            Snapchat limite à 5 Go — exporte avant suppression
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
            Sauve tes Memories Snapchat avant qu&apos;ils disparaissent.
          </h1>
          <p className="max-w-xl text-lg text-muted">
            Snapchat t&apos;a envoyé un export illisible ? SnapArchive transforme{" "}
            <code className="rounded bg-card px-1.5 py-0.5 font-mono text-sm text-foreground">
              memories_history.json
            </code>{" "}
            en un dossier photo trié par date — sans compte, sans abonnement.
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:justify-start">
            <Link
              href="/export"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground transition hover:brightness-95"
            >
              <IconSpark className="h-4 w-4" />
              Commencer l&apos;export
            </Link>
            <a
              href={SNAP_ACCOUNT_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-card-border bg-card/60 px-6 py-3 font-medium backdrop-blur transition hover:border-foreground/30"
            >
              Mes données Snapchat
            </a>
          </div>
        </ScrollReveal>

        <div className="w-full md:col-span-1">
          <HeroVisual />
        </div>
      </section>

      <section className="relative border-y border-card-border/70 bg-card/30 px-6 py-14 md:py-16">
        <ScrollReveal direction="none">
          <div className="mx-auto grid w-full max-w-6xl gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="flex h-full gap-4 rounded-2xl border border-card-border bg-card/80 p-5 backdrop-blur"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-medium">{feature.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">{feature.body}</p>
                </div>
              </article>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section id="comment-ca-marche" className="relative px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-accent">
              Parcours complet
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Comment ça marche
            </h2>
            <p className="mt-3 text-muted">
              Deux phases : d&apos;abord l&apos;export officiel Snapchat (obligatoire), ensuite
              SnapArchive nettoie et trie tes fichiers.
            </p>
          </ScrollReveal>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {steps.map((step, index) => (
              <ScrollReveal key={step.title} delay={index * 90}>
                <article className="group h-full rounded-2xl border border-card-border bg-card p-5 transition hover:border-foreground/15 hover:shadow-lg hover:shadow-black/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent transition group-hover:scale-105">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <p className="font-mono text-sm text-accent">0{index + 1}</p>
                  </div>
                  <h3 className="mt-4 text-lg font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/90">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex gap-2">
                        <span className="shrink-0 text-accent">→</span>
                        <span>{linkifyDetail(detail)}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={120} className="mt-8 text-sm text-muted">
            Raccourci direct :{" "}
            <a
              href={SNAP_ACCOUNT_URL}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline"
            >
              accounts.snapchat.com
            </a>{" "}
            → Mes données → Export your Memories + Export JSON files.
          </ScrollReveal>

          <ScrollReveal delay={160} className="mt-12">
            <ExportReminderPanel />
          </ScrollReveal>
        </div>
      </section>

      <section className="relative border-t border-card-border/70 bg-background px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-accent">FAQ</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Questions fréquentes
            </h2>
          </ScrollReveal>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map((item, index) => (
              <ScrollReveal key={item.q} delay={index * 80}>
                <article className="h-full rounded-2xl border border-card-border bg-card p-5 transition hover:border-foreground/15">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-background text-accent">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium">{item.q}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.a}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
